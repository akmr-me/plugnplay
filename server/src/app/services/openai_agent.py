from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from langchain_core.exceptions import OutputParserException
from openai import BadRequestError
from typing import Literal
from ..crud.crud_credentials import crud_credentials
from ..schemas.credential import CredentialRead
from app.core.db.context import db_context
import json

DEFAULT_JSON_SYSTEM_PROMPT = (
    "You are a helpful assistant. Always respond ONLY in valid JSON format. "
    "Do not include explanations or formatting, just return the JSON object."
)


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
        response_format={"type": "json_object"},
    )

    # print("model", model)
    # print("system_prompt", system_prompt)
    # print("user_prompt", user_prompt, api_key)

    # Step 2: Create LangChain prompt

    final_system_prompt = (
        system_prompt.strip()
        if system_prompt and system_prompt.strip()
        else DEFAULT_JSON_SYSTEM_PROMPT
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", final_system_prompt),
            ("user", user_prompt),
        ]
    )

    # Step 3: Build Graph (simple one-step LLM call)
    def run_chain():
        chain = prompt | llm
        response = chain.invoke({})  # response is AIMessage

        # Extract the content (which may be a JSON string)
        response_str = response.content

        # Then safely load it if it's JSON
        try:
            return {"result": json.loads(response_str)}
        except json.JSONDecodeError:
            return {"result": response_str}  # fallback if not valid JSON

    return run_chain()


async def structure_invocation(data):
    db = db_context.get()
    credential_id = data.get("credential_id")
    description = data.get("description")
    model = data.get("model")
    prompt = data.get("prompt")
    system_prompt = data.get("system_prompt")
    response_format = data.get("response_format")
    # # print()
    # # print()
    # print("credential_id", data)
    # # print()
    # # print()

    credential = await crud_credentials.get(
        db=db, id=credential_id, schema_to_select=CredentialRead
    )
    if not credential:
        print(f"Credential with id {credential_id} not found")
        raise ValueError(f"Credential not found")
    print(credential)
    api_key = credential["api_key_value"]

    import traceback

    cached_error = None

    try:
        run_chain = create_open_agent(
            api_key=api_key,
            model=model,
            system_prompt=system_prompt,
            user_prompt=prompt,
            # response_format="json_object",
        )
    except BadRequestError as e:
        # OpenAI SDK error directly exposed
        error_data = e.response.json()
        cached_error = error_data.get("error", {}).get("message", str(e))
        print("Cached OpenAI error:", cached_error)
        raise ValueError(f"OpenAI BadRequestError: {cached_error}")

    except OutputParserException as e:
        # LangChain output parsing failed — could be due to invalid JSON
        cached_error = str(e)
        print("LangChain OutputParserException:", cached_error)
        raise ValueError(f"LangChain output parsing error: {cached_error}")

    except Exception as e:
        # Generic error handler
        cached_error = str(e)
        print("Unhandled LangChain error:", traceback.format_exc())
        raise ValueError(f"Unhandled error: {cached_error}")

    return run_chain
