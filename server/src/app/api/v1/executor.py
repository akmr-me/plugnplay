from fastapi import (
    APIRouter,
    Depends,
    Request,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import Any, Annotated
from ...services.openai_agent import structure_invocation
from app.schemas.user import UserRead

from app.core.db.database import async_get_db
from app.api.dependencies import get_current_user, get_current_user_from_token
from app.models.workflow import Workflow
from app.models.credential import Credential
from app.models.user import User
from app.services.workflow_builder import WorkflowGraphBuilder
from app.crud.crud_workflows import crud_workflows
from app.models.workflow import Workflow
from app.schemas.workflow import WorkflowRead
from urllib.parse import parse_qs
from app.services.send_custom_http_request import send_custom_http_request

from app.core.websoket_store import active_ws_connections


router = APIRouter(tags=["workflow-run"])


@router.post("/excecutor/{workflow_id}", response_class=JSONResponse)
async def run_workflow(
    workflow_id: UUID,
    request: Request,
    current_user: Annotated[UserRead, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> JSONResponse:

    # 2. Get the workflow from DB and verify ownership
    workflow_read = await crud_workflows.get(
        db=db, id=workflow_id, schema_to_select=WorkflowRead
    )

    if not workflow_read:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # if workflow["user_id"] != current_user["user_id"]:
    #     raise HTTPException(status_code=403, detail="You do not own this workflow")

    # print(workflow_read)
    compiled_graph = WorkflowGraphBuilder(workflow_read).build_graph()
    # Find trigger node
    trigger_node = [
        node for node in workflow_read["nodes"] if "trigger" in node["type"]
    ][0]
    trigger_type = trigger_node["type"]
    if isinstance(trigger_type, list):
        trigger_type = trigger_type[0]  # or handle differently

    input_payload = {trigger_type: trigger_node["data"]["output"]}
    result = await compiled_graph.ainvoke(
        {
            "input": input_payload,
            "state": {
                "nodes": {node["id"]: node for node in workflow_read["nodes"]},
                "edges": {edge["id"]: edge for edge in workflow_read["edges"]},
            },
        }
    )
    print("restul", result)

    # 3. Get associated credentials (if needed)
    # Example: credential_id stored on workflow
    # credentials = None
    # if hasattr(workflow, "credential_id"):
    #     cred_stmt = select(Credential).where(Credential.id == workflow.credential_id)
    #     cred_result = await db.execute(cred_stmt)
    #     credentials = cred_result.scalar_one_or_none()

    # # 4. Simulate node execution logic
    # try:
    #     # You can replace this block with actual logic per node
    #     output = {
    #         "status": "success",
    #         "input": input_data,
    #         "workflow": str(workflow.id),
    #         "executed_by": current_user["id"],
    #         "used_credential": credentials.id if credentials else None,
    #         "result": "✅ simulated workflow execution complete",
    #     }
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Workflow execution failed: {e}")

    # # 5. Return JSON response
    return JSONResponse(
        content={
            "message": "Workflow executed successfully",
        }
    )


@router.post("/excecutor/{workflow_id}/test", response_class=JSONResponse)
async def run_workflow_nodes(
    workflow_id: UUID,
    request: Request,
    # current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(async_get_db)],
) -> JSONResponse:
    # 1. Get input JSON
    try:
        input_data: dict = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # 2. Get the workflow from DB and verify ownership
    stmt = select(Workflow).where(Workflow.id == workflow_id)
    result = await db.execute(stmt)
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # if workflow.user_id != current_user["id"]:
    #     raise HTTPException(status_code=403, detail="You do not own this workflow")

    # 3. Get associated credentials (if needed)
    # Example: credential_id stored on workflow
    # print("input data", input_data)
    try:
        result = await structure_invocation(input_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
    # print(result)
    # 4. Simulate node execution logic
    # try:
    #     # You can replace this block with actual logic per node
    #     # output = {
    #     #     "status": "success",
    #     #     "input": input_data,
    #     #     "workflow": str(workflow.id),
    #     #     "executed_by": current_user["id"],
    #     #     "used_credential": credentials.id if credentials else None,
    #     #     "result": "✅ simulated workflow execution complete",
    #     # }
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Workflow execution failed: {e}")

    # 5. Return JSON response
    return JSONResponse(content={"result": result["result"]})


@router.websocket("/ws/{workflow_id}")
async def workflow_websocket(
    websocket: WebSocket,
    workflow_id: UUID,
    db: AsyncSession = Depends(async_get_db),
    # current_user: UserRead = Depends(get_current_user),
):
    query_params = parse_qs(websocket.url.query)
    token = query_params.get("token", [None])[0]

    await websocket.accept()
    print("WebSocket connection established for workflow:", workflow_id)
    user = await get_current_user_from_token(token, db)

    if not user:
        await websocket.send_json({"error": "Unauthorized"})
        await websocket.close()
        return

    user_id = user.user_id
    # if user_id in active_ws_connections:
    #     print(f"Closed previous WebSocket connection for user {user_id}")
    #     await active_ws_connections[user_id].close()

    active_ws_connections[user_id] = websocket
    try:
        # 1. Fetch and verify workflow
        workflow_read = await crud_workflows.get(
            db=db, id=workflow_id, schema_to_select=WorkflowRead
        )

        if not workflow_read:
            await websocket.send_json({"error": "Workflow not found"})
            return

        # 2. Optional: verify the user owns the workflow
        # if workflow_read["user_id"] != current_user.id:
        #     await websocket.send_json({"error": "Unauthorized"})
        #     return

        # 3. Run the workflow
        print("before compiled graph")
        try:
            compiled_graph = WorkflowGraphBuilder(workflow_read).build_graph()
        except Exception as e:
            print(f"Error compiling workflow: {str(e)}")
            await websocket.send_json(
                {"error": f"Workflow compilation failed: {str(e)}"}
            )
            if user_id in active_ws_connections:
                await active_ws_connections[user_id].close()
                del active_ws_connections[user_id]
                return

        trigger_node = [
            node for node in workflow_read["nodes"] if "trigger" in node["type"]
        ][0]
        trigger_type = trigger_node["type"]
        if isinstance(trigger_type, list):
            trigger_type = trigger_type[0]

        input_payload = {trigger_type: trigger_node["data"]["output"]}
        # result = await compiled_graph.ainvoke(
        try:
            async for chunk in compiled_graph.astream(
                {
                    "input": input_payload,
                    "state": {
                        "nodes": {node["id"]: node for node in workflow_read["nodes"]},
                        "edges": {edge["id"]: edge for edge in workflow_read["edges"]},
                    },
                    "user_id": user_id,
                }
            ):
                # Process each streamed chunk here
                print("Streamed chunk:", chunk)
                await active_ws_connections[user_id].send_json(
                    {
                        "message": "Workflow execution in progress",
                        "chunk": chunk,
                    }
                )

            print("after streaming")
            # 4. Send result to that user's WebSocket only
            await websocket.send_json(
                {
                    "message": "Workflow executed successfully",
                    # "result": result,
                }
            )

        except Exception as e:
            print("Error during workflow execution:", e)
            # Log the error (optional)
            import traceback
            import re

            traceback.print_exc()

            tb_str = traceback.format_exc()
            print("Traceback:", tb_str)

            match = re.search(r"During task with name '(.+?)' and id '(.+?)'", tb_str)
            if match:
                failed_node_name = match.group(1)
                failed_node_id = match.group(2)
            else:
                failed_node_name = failed_node_id = None

            # Send error to user
            error_msg = str(e)
            print("error message", error_msg)
            await websocket.send_json(
                {
                    "message": "Workflow execution failed",
                    "error": error_msg,
                    "failed_node_name": failed_node_name,
                    "failed_node_id": failed_node_id,
                }
            )

    except WebSocketDisconnect:
        print(f"User {user_id} disconnected.")
        if user_id in active_ws_connections:
            del active_ws_connections[user_id]


@router.post("/excecutor/{workflow_id}/node/send_email", response_class=JSONResponse)
async def send_email_node(
    request: Request,
    workflow_id: UUID,
    db: AsyncSession = Depends(async_get_db),
    # current_user: Annotated[dict, Depends(get_current_user)],
) -> JSONResponse:
    # 1. Get input JSON
    try:
        input_data: dict = await request.json()
        print()
        print()
        print(input_data)
        print()
        print()
        # Form content for http request
        http_data = {
            "httpMethod": "POST",
            "url": "https://api.resend.com/emails",
            "includeBody": True,
            "bodyContent": {
                "from": input_data["fromEmail"],
                "to": input_data["toEmails"],
                "cc": input_data["ccEmails"],
                "bcc": input_data["bccEmails"],
                "subject": input_data["subject"],
                "html": input_data["body"],
            },
            "credentialId": input_data["credentialId"],
            "authType": input_data.get("authType", "bearer"),
        }

        print("http_data", http_data)

        response = await send_custom_http_request(http_data=http_data)
        print(response)

        # 3. Get associated credentials (if needed)
        # Example: credential_id stored on workflow

    except Exception as e:
        print("Error while sending email", e)
        raise HTTPException(
            status_code=400,
            detail={"short_error": "Invalid JSON payload", "error": str(e)},
        )

    # 2. Get the workflow from DB and verify ownership

    return JSONResponse(content={"message": "Email sent successfully"})


# {
#     from: "Amresh <onboarding@resend.dev>",
#     to: "someone@example.com",
#     subject: "Hello from Resend",
#     html: "<p>This is a test email</p>",
#   }
# {
#     "credentialId": "019842ac-02e7-74b0-94af-136e619471e6",
#     "fromEmail": "kumar.akumar.amresh@gmail.com",
#     "fromName": "Amresh Kumar",
#     "toEmails": ["0to1official@gmail.com"],
#     "ccEmails": [],
#     "bccEmails": [],
#     "subject": "Today's New letter",
#     "body": "Dear,\nsaching this is email to remide you today work rest.\n\nbye",
#     "priority": "normal",
#     "format": "html",
# }
