class FormValidationError(Exception):
    def __init__(self, errors):
        self.errors = errors

def format_form_errors(errors):
    formatted_errors = {}
    for field, error_messages in errors.items():
        formatted_errors[field] = [message for message in error_messages]
    return str(formatted_errors)

def validate_form(form_class, request_data):
    form = form_class(data=request_data)
    if not form.validate():
        raise FormValidationError(format_form_errors(form.errors))
    return form