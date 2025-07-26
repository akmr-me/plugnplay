def build_resend_http_data(input_data: dict) -> dict:
    required_fields = ["fromEmail", "toEmails", "subject", "body", "credentialId"]

    missing_fields = [field for field in required_fields if not input_data.get(field)]
    if missing_fields:
        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

    # Optional fields (can be empty lists or None)
    cc_emails = input_data.get("ccEmails", [])
    bcc_emails = input_data.get("bccEmails", [])

    http_data = {
        "httpMethod": "POST",
        "url": "https://api.resend.com/emails",
        "includeBody": True,
        "bodyContent": {
            "from": input_data["fromEmail"],
            "to": input_data["toEmails"],
            "cc": cc_emails,
            "bcc": bcc_emails,
            "subject": input_data["subject"],
            "html": input_data["body"],
        },
        "credentialId": input_data["credentialId"],
        "authType": input_data.get("authType", "bearer"),
    }

    return http_data
