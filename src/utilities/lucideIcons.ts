import {
    Handshake,
    Laptop,
    Paintbrush,
    Server,
    Smartphone,
    SquareCode,
} from "lucide-react";
import type { LucideIcon as LucideIconType } from "lucide-react";

export const lucideIconMap = {
    Laptop: Laptop,
    SquareCode: SquareCode,
    Handshake: Handshake,
    Paintbrush: Paintbrush,
    Smartphone: Smartphone,
    Server: Server,
} as const;

export type LucideIconName = keyof typeof lucideIconMap;

export const getLucideIcon = (name: LucideIconName): LucideIconType => {
    return lucideIconMap[name];
};
