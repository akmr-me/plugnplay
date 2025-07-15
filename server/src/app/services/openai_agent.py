from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from typing import Literal
from ..crud.crud_credentials import crud_credentials
from ..schemas.credential import CredentialRead
from app.core.db.context import db_context


def create_open_agent(
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    response_format: Literal["text", "json"] = "text",
):
    # Step 1: Set up LLM
    llm = ChatOpenAI(
        api_key=api_key,
        model=model,
        temperature=0.7,
        # response_format="json_object",
    )

    # print("model", model)
    # print("system_prompt", system_prompt)
    # print("user_prompt", user_prompt, api_key)

    # Step 2: Create LangChain prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("user", user_prompt),
        ]
    )

    # Step 3: Build Graph (simple one-step LLM call)
    def run_chain():
        chain = prompt | llm
        return {"result": chain.invoke({})}

    return run_chain()


async def structure_invocation(data):
    db = db_context.get()
    credential_id = data.get("credential_id")
    description = data.get("description")
    model = data.get("model")
    prompt = data.get("prompt")
    system_prompt = data.get("system_prompt")
    response_format = data.get("response_format")
    # print()
    # print()
    # print("credential_id", data)
    # print()
    # print()

    credential = await crud_credentials.get(
        db=db, id=credential_id, schema_to_select=CredentialRead
    )
    print(credential)
    api_key = credential["api_key_value"]

    run_chain = create_open_agent(
        api_key=api_key,
        model=model,
        system_prompt=system_prompt,
        user_prompt=prompt,
        # response_format=response_format,
    )

    return run_chain
