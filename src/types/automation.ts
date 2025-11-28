import { Automation, AutomationType } from "@prisma/client";

export type { Automation, AutomationType };

export interface AutomationWithStats extends Automation {
    _count?: {
        notifications: number;
    };
}
