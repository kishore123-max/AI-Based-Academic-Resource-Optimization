from pydantic import BaseModel, Field


class ResourceInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    available_units: int = Field(ge=0)


class RequestInput(BaseModel):
    id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=160)
    department: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    requested_units: int = Field(gt=0)
    urgency: int = Field(ge=1, le=5)
    students_affected: int = Field(gt=0)


class OptimizationInput(BaseModel):
    resources: list[ResourceInput]
    requests: list[RequestInput]


class Allocation(BaseModel):
    request_id: str
    request_title: str
    resource_name: str
    allocated_units: int
    requested_units: int
    priority_score: float


class OptimizationResponse(BaseModel):
    algorithm: str
    allocations: list[Allocation]
    unfilled_requests: list[str]