from datetime import datetime

def date_to_int(date_str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    # Format the datetime object to a string in YYYYMMDD format
    date_int_str = date_obj.strftime("%Y%m%d")
    # Convert the string to an integer
    date_int = int(date_int_str)
    return date_int