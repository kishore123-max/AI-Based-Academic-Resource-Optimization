from app.schemas import Allocation, OptimizationInput, OptimizationResponse


def optimize_resources(payload: OptimizationInput) -> OptimizationResponse:
    """Allocate matching capacity by urgency, student impact, and demand size."""
    remaining = [resource.available_units for resource in payload.resources]
    largest_student_group = max(
        (request.students_affected for request in payload.requests), default=1
    )
    matching_capacity = {
        request.id: sum(
            resource.available_units
            for resource in payload.resources
            if resource.category.casefold() == request.category.casefold()
        )
        for request in payload.requests
    }

    def priority_score(request_index: int) -> float:
        request = payload.requests[request_index]
        impact = request.students_affected / largest_student_group
        demand = request.requested_units / max(matching_capacity[request.id], 1)
        return round(request.urgency * 10 + impact * 40 + demand * 10, 2)

    ordered_requests = sorted(
        range(len(payload.requests)), key=priority_score, reverse=True
    )
    allocations: list[Allocation] = []
    unfilled_requests: list[str] = []

    for request_index in ordered_requests:
        request = payload.requests[request_index]
        units_needed = request.requested_units
        matching_resources = [
            index
            for index, resource in enumerate(payload.resources)
            if resource.category.casefold() == request.category.casefold()
            and remaining[index] > 0
        ]
        matching_resources.sort(
            key=lambda index: (
                remaining[index] < units_needed,
                remaining[index] if remaining[index] >= units_needed else -remaining[index],
            )
        )

        for resource_index in matching_resources:
            allocated = min(units_needed, remaining[resource_index])
            if allocated == 0:
                continue
            allocations.append(
                Allocation(
                    request_id=request.id,
                    request_title=request.title,
                    resource_name=payload.resources[resource_index].name,
                    allocated_units=allocated,
                    requested_units=request.requested_units,
                    priority_score=priority_score(request_index),
                )
            )
            remaining[resource_index] -= allocated
            units_needed -= allocated
            if units_needed == 0:
                break

        if units_needed:
            unfilled_requests.append(request.id)

    return OptimizationResponse(
        algorithm="weighted-priority-greedy-v1",
        allocations=allocations,
        unfilled_requests=unfilled_requests,
    )