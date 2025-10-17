"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Cotizador CRM</CardTitle>
          <CardDescription>Sistema de cotizaciones para PYMES</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => toast.success("Funciona!")}>
            Probar notificación sonner
          </Button> 
        </CardContent>
      </Card>
    </main>
  );
}
