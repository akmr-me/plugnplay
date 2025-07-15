# from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json

# app = FastAPI()


# Your schema data structure
class FormField(BaseModel):
    label: str
    type: str
    placeholder: str
    required: bool
    position: int
    id: str
    form_id: str
    created_at: str


class FormSchema(BaseModel):
    title: str
    description: str
    id: str
    workflow_id: str
    created_at: str
    fields: List[FormField]


# Sample data - replace with your actual data source
SAMPLE_FORM_DATA = {
    "title": "Blog writer 25",
    "description": "Your can fill the for and write topic give word count.\nthis is text to update. Amresh",
    "id": "0197f50c-e722-7a32-90b3-2022aaf071e3",
    "workflow_id": "0197f50c-e722-7a32-90b3-2022aaf071e3",
    "created_at": "2025-07-10T20:23:01.826476Z",
    "fields": [
        {
            "label": "First Name",
            "type": "text",
            "placeholder": "Placeholder7",
            "required": False,
            "position": 1,
            "id": "0197fa22-998d-7f71-8c34-4e9f87225740",
            "form_id": "0197f50c-e722-7a32-90b3-2022aaf071e3",
            "created_at": "2025-07-11T15:37:41.007343Z",
        },
        {
            "label": "Email",
            "type": "email",
            "placeholder": "Please Enter a valid",
            "required": False,
            "position": 2,
            "id": "0197fa22-e6ec-75c1-86df-2853a5085138",
            "form_id": "0197f50c-e722-7a32-90b3-2022aaf071e3",
            "created_at": "2025-07-11T15:38:00.813119Z",
        },
    ],
}


def generate_form_html(form_data: Dict[str, Any]) -> str:
    """Generate HTML form based on form schema"""

    # Sort fields by position
    fields = sorted(form_data.fields, key=lambda x: x.position)

    # Generate form fields HTML
    fields_html = ""
    for field in fields:
        field_type = field.type
        field_id = field.id
        label = field.label
        placeholder = field.placeholder
        required = "required" if field.required else ""

        # Generate appropriate input based on type
        if field_type == "email":
            input_html = f"""
            <input 
                type="email" 
                id="{field_id}" 
                name="{field_id}"
                placeholder="{placeholder}"
                {required}
                class="form-input w-full h-12"
            />"""
        elif field_type == "text":
            input_html = f"""
            <input 
                type="text" 
                id="{field_id}" 
                name="{field_id}"
                placeholder="{placeholder}"
                {required}
                class="form-input w-full h-12"
            />"""
        else:
            # Default to text input for other types
            input_html = f"""
            <input 
                type="text" 
                id="{field_id}" 
                name="{field_id}"
                placeholder="{placeholder}"
                {required}
                class="form-input w-full h-12"
            />"""

        fields_html += f"""
        <div class="space-y-3">
            <label for="{field_id}" class="text-sm font-medium text-white block">
                {label}
                {' <span class="text-red-400">*</span>' if field.required else ''}
            </label>
            {input_html}
        </div>
        """

    # Complete HTML template
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{form_data.title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            /* Custom styles for dark theme form */
            .form-container {{
                background: #1a1a1a;
                border-radius: 12px;
                border: 1px solid #2a2a2a;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }}
            
            .form-input {{
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                color: #e5e5e5;
                border-radius: 8px;
                padding: 12px 16px;
                font-size: 14px;
                transition: all 0.15s ease;
            }}
            
            .form-input:focus {{
                outline: none;
                border-color: #4a4a4a;
                background: #2f2f2f;
            }}
            
            .form-input::placeholder {{
                color: #9ca3af;
            }}
            
            .btn-primary {{
                background: #f3f4f6;
                color: #1f2937;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
                font-size: 14px;
            }}
            
            .btn-primary:hover {{
                background: #e5e7eb;
            }}
            
            .btn-primary:focus {{
                outline: none;
                box-shadow: 0 0 0 3px rgba(243, 244, 246, 0.1);
            }}
            
            .success-message {{
                background: #064e3b;
                color: #6ee7b7;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #065f46;
            }}
            
            .error-message {{
                background: #7f1d1d;
                color: #fca5a5;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #991b1b;
            }}
        </style>
    </head>
    <body class="bg-black min-h-screen py-8">
        <div class="container mx-auto px-4 max-w-md">
            <div class="form-container p-8">
                <div class="mb-8">
                    <h1 class="text-2xl font-bold text-white mb-3">{form_data.title}</h1>
                    <p class="text-gray-400 text-sm leading-relaxed">{form_data.description}</p>
                </div>
                
                <div id="message" class="mb-6 hidden"></div>
                
                <form id="dynamicForm" class="space-y-6">
                    {fields_html}
                    
                    <div class="pt-2">
                        <button type="submit" class="btn-primary w-full">
                            Submit Form
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <script>
            document.getElementById('dynamicForm').addEventListener('submit', async function(e) {{
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                const messageDiv = document.getElementById('message');
                
                try {{
                    const response = await fetch('/api/v1/submit/form/{form_data.id}', {{
                        method: 'POST',
                        headers: {{
                            'Content-Type': 'application/json',
                        }},
                        body: JSON.stringify(data)
                    }});
                    
                    if (response.ok) {{
                        const result = await response.json();
                        messageDiv.innerHTML = '<div class="success-message">Form submitted successfully!</div>';
                        messageDiv.classList.remove('hidden');
                        this.reset();
                    }} else {{
                        throw new Error('Form submission failed');
                    }}
                }} catch (error) {{
                    messageDiv.innerHTML = '<div class="error-message">Error submitting form. Please try again.</div>';
                    messageDiv.classList.remove('hidden');
                }}
            }});
        </script>
    </body>
    </html>
    """

    return html_template


# @app.get("/form/{form_id}", response_class=HTMLResponse)
# async def get_form(form_id: str):
#     """Get HTML form by form ID"""

#     # In a real application, you would fetch this from your database
#     # For now, we'll use the sample data if the ID matches
#     if form_id == SAMPLE_FORM_DATA.id"]:
#         form_data = SAMPLE_FORM_DATA
#     else:
#         raise HTTPException(status_code=404, detail="Form not found")

#     return generate_form_html(form_data)


# @app.post("/form/{form_id}")
# async def submit_form(form_id: str, request: Request):
#     """Handle form submission"""

#     # Get the JSON data from the request
#     form_data = await request.json()

#     # Here you would typically:
#     # 1. Validate the form data
#     # 2. Save to database
#     # 3. Send notifications, etc.

#     # For now, just return the submitted data
#     return {
#         "status": "success",
#         "message": "Form submitted successfully",
#         "form_id": form_id,
#         "submitted_data": form_data,
#     }


# # Optional: Add a route to get form schema as JSON
# @app.get("/form/{form_id}/schema")
# async def get_form_schema(form_id: str):
#     """Get form schema as JSON"""
#     if form_id == SAMPLE_FORM_DATA.id"]:
#         return SAMPLE_FORM_DATA
#     else:
#         raise HTTPException(status_code=404, detail="Form not found")


# if __name__ == "__main__":
#     import uvicorn

#     uvicorn.run(app, host="0.0.0.0", port=8000)
