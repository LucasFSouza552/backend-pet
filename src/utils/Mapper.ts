export function mapToDTO<Entity extends object, DTO extends object>(
    entity: Entity,
    keys: (keyof DTO)[]
): DTO {
    const dto = {} as DTO;

    keys.forEach((key) => {
        if ((key) in entity) {
            dto[key] = entity[key as unknown as keyof Entity] as any;
        }
    });

    return dto;
}
