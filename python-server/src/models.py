from typing import Annotated
from pydantic import BaseModel, constr


class ConvertImgReq(BaseModel):
    """
    A Pydantic model that represents a request's body to convert an image.
    """

    img: Annotated[str, constr(pattern=r"^data:image/png;base64,")]
