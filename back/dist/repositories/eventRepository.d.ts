import { Event, CreateEventDto, UpdateEventDto } from "../types";
export declare class EventRepository {
    findAll(horseId?: string): Promise<Event[]>;
    findById(id: string): Promise<Event | null>;
    create(data: CreateEventDto): Promise<Event>;
    update(id: string, data: UpdateEventDto): Promise<Event | null>;
    delete(id: string): Promise<boolean>;
    getReminders(horseId?: string): Promise<Event[]>;
    /**
     * Invalide le cache pour un événement
     */
    private invalidateCache;
    private mapRowToEvent;
}
declare const _default: EventRepository;
export default _default;
//# sourceMappingURL=eventRepository.d.ts.map