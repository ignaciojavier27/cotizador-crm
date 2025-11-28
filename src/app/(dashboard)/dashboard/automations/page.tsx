import { Metadata } from "next";
import AutomationsClient from "@/components/automations/AutomationsClient";

export const metadata: Metadata = {
    title: "Automatizaciones | CRM",
    description: "Gestión de automatizaciones de correo",
};

export default function AutomationsPage() {
    return <AutomationsClient />;
}
