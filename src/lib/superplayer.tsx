"use server"
import { handleLog } from "./log"

const spHeaders = new Headers();
spHeaders.append("Content-Type", "application/json");
spHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.NTkzN2M5OWMtZTBkYy00N2Q4LWE1MTMtNDNhNmU0ZjA4YTdj.0Ep8-oa5yOkMd3Mrocuh7Ft7FXd6wCH3tPlv7w6rsvQ");

export const handleSearchExitLag = async (cleanedID: string) => {

    try {
        const getSuperPlayer = await fetch(`https://integrator.superplayer.company/5937c99c-e0dc-47d8-a513-43a6e4f08a7c/users?document=${cleanedID}`, {
            headers: spHeaders,
            redirect: "follow",
        });

        if (!getSuperPlayer.ok) {
            console.error("Erro ao buscar dados do SuperPlayer:", getSuperPlayer.status, getSuperPlayer.statusText);
            return;
        }

        const resSuperPlayer = await getSuperPlayer.json();
        if (!resSuperPlayer) {
            console.error("Erro ao parsear dados do SuperPlayer:", getSuperPlayer);
            return;
        }

        return {
            name: resSuperPlayer.users[0]?.name as string,
            email: resSuperPlayer.users[0]?.email as string,
            phone: resSuperPlayer.users[0]?.phone as string,
            services: "ExitLag",
            status: resSuperPlayer.users[0]?.status as string,
            product_id: resSuperPlayer.users[0]?.product_id as number,
            document: resSuperPlayer.users[0]?.document.value,
            statusCode: 200,
        }

    } catch (error) {
        return null
    }
}

export const handleReenviarSP = async (email: string) => {
    try {
        if (!email) {
            throw new Error("Email is a required parameter in handleReenviarSP");
        }

        const raw = JSON.stringify({
            "email": email,
            "product": "::exitlag"
        });

        const resendSP = await fetch("https://integrator.superplayer.company/5937c99c-e0dc-47d8-a513-43a6e4f08a7c/send-welcome-email", {
            method: "POST",
            headers: spHeaders,
            body: raw,
            redirect: "follow"
        });

        if (!resendSP.ok) {
            throw new Error(`Erro ao reenviar email do SuperPlayer: ${resendSP.status} ${resendSP.statusText}`);
        }

        const result = await resendSP.json();
        if (!result) {
            throw new Error("Erro ao parsear resposta do SuperPlayer");
        }

        return { result };

    } catch (error) {
        return null
    }
}

export const handleFixitSP = async (cleanedID: string) => {
    try {

    } catch (error) {
        return null
    }
}