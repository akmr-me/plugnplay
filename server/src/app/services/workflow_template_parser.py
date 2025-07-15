import re


class WorkflowTemplateParser:
    def __init__(self):
        # Regex to match template variables like {{$node.data.field}}
        self.template_regex = re.compile(r'"?\{\{\s*\$([^}]+?)\s*\}\}"?')

    def parse_templates(self, value, context):
        if isinstance(value, str):
            parsedstr = self.parse_string_templates(value, context)
            return parsedstr
        elif isinstance(value, list):
            return [self.parse_templates(item, context) for item in value]
        elif isinstance(value, dict):
            result = {}
            for key, val in value.items():
                result[key] = self.parse_templates(val, context)
            return result
        return value

    def parse_string_templates(self, s: str, context: dict):
        """
        Parse template variables in a string
        Args:
            s (str): String containing template variables
            context (dict): Available data context
        Returns:
            str: String with variables resolved
        """

        def replace_match(match):
            expression = match.group(1)
            try:
                value = self.resolve_expression(expression, context)
                return str(value) if value is not None else match.group(0)
            except Exception as e:
                print(
                    f"Warning: Failed to resolve template: {match.group(0)}. Error: {e}"
                )
                return match.group(0)  # Return original if can't resolve

        return self.template_regex.sub(replace_match, s)

    def resolve_expression(self, expression: str, context):
        """
        Resolve a dot notation expression like "node1.data.user.name"
        Args:
            expression (str): Dot notation expression
            context (any): Available data context
        Returns:
            any: Resolved value
        """
        parts = expression.split(".")
        current = context

        for part in parts:
            if current is None:
                return None

            # Handle array indices like data[0] or data['key']
            if "[" in part and "]" in part:
                prop_and_index = part.split("[", 1)
                prop = prop_and_index[0]
                index_part = prop_and_index[1].replace("]", "").strip()

                if prop:
                    if isinstance(current, dict) and prop in current:
                        current = current[prop]
                    elif isinstance(current, (list, tuple)) and prop.isdigit():
                        try:
                            current = current[int(prop)]
                        except (IndexError, ValueError):
                            return None
                    else:
                        return None

                # Try to convert index to int for list access, or strip quotes for dict key
                if index_part.isdigit():
                    idx = int(index_part)
                    if isinstance(current, (list, tuple)) and 0 <= idx < len(current):
                        current = current[idx]
                    else:
                        return None
                else:
                    # Remove quotes from the index part
                    key = index_part.strip("'\"")
                    if isinstance(current, dict) and key in current:
                        current = current[key]
                    else:
                        return None
            else:
                if isinstance(current, dict) and part in current:
                    current = current[part]
                elif isinstance(current, (list, tuple)) and part.isdigit():
                    try:
                        current = current[int(part)]
                    except (IndexError, ValueError):
                        return None
                else:
                    return None
        return current

    def has_templates(self, s: str):
        """
        Check if a string contains template variables
        Args:
            s (str): String to check
        Returns:
            bool: True if contains templates
        """
        return isinstance(s, str) and self.template_regex.search(s) is not None

    def extract_templates(self, s: str):
        """
        Extract all template variables from a string
        Args:
            s (str): String to analyze
        Returns:
            list: List of dictionaries with 'full', 'expression', and 'index'
        """
        matches = []
        for match in self.template_regex.finditer(s):
            matches.append(
                {
                    "full": match.group(0),
                    "expression": match.group(1),
                    "index": match.start(),
                }
            )
        return matches
