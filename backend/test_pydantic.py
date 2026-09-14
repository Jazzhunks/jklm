from pydantic import BaseModel, __version__
print(__version__)

class Model(BaseModel):
    a: int
    b: str = None

m = Model(a=1)
print(m.model_dump(exclude_none=True))
print(m.b)
