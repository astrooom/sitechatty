from datetime import datetime

def strdate_to_intdate(date_str: str) -> int:
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    date_int = int(date_obj.strftime("%Y%m%d"))
    return date_int
    