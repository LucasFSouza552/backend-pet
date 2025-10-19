export function mapToDTO<Entity extends object, DTO extends object>(
    entity: Entity,
    keys: (keyof DTO)[] = []
): DTO {
    const dto = {} as DTO;

    if ("_id" in entity && !("id" in dto)) {
        (dto as any).id = (entity as any)["_id"].toString();
    }

    keys.forEach((key) => {
        if (key === "id") return;

        if (key in entity) {
            dto[key] = (entity as any)[key];
        }
    });

    return dto;
}
