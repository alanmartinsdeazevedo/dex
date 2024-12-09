"use server"
import { handleLog } from "./log"

const spHeaders = new Headers();
spHeaders.append("Content-Type", "application/json");
spHeaders.append("Authorization", `Bearer ${process.env.SUPERPLAYER_API_KEY}`);

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
            status: resSuperPlayer.users[0]?.status.replace('suspended','suspend') as string,
            product_id: resSuperPlayer.users[0]?.product_id as number,
            document: resSuperPlayer.users[0]?.document.value,
            statusCode: 200,
        }

    } catch (error) {
        return null
    }
}

export const handleReenviarSP = async (email: string, document: string) => {
    try {
        console.log("handleReenviarSP: Iniciando reenvio de email do SuperPlayer");
        if (!email) {
            console.log("handleReenviarSP: Email is a required parameter in handleReenviarSP");
            throw new Error("Email is a required parameter in handleReenviarSP");
        }

        const raw = JSON.stringify({
            "email": email,
            "product": "::exitlag"
        });

        console.log("handleReenviarSP: Enviando request para https://integrator.superplayer.company/5937c99c-e0dc-47d8-a513-43a6e4f08a7c/send-welcome-email");
        const resendSP = await fetch("https://integrator.superplayer.company/5937c99c-e0dc-47d8-a513-43a6e4f08a7c/send-welcome-email", {
            method: "POST",
            headers: spHeaders,
            body: raw,
            redirect: "follow"
        });

        console.log("handleReenviarSP: Resposta recebida do SuperPlayer:", resendSP.status, resendSP.statusText);
        if (!resendSP.ok) {
            console.log("handleReenviarSP: Erro ao reenviar email do SuperPlayer:", resendSP.status, resendSP.statusText);
            throw new Error(`Erro ao reenviar email do SuperPlayer: ${resendSP.status} ${resendSP.statusText}`);
        }

        const resSend = await resendSP.json();
        console.log("handleReenviarSP: Resposta final:", resSend);

        if (resSend.data.message === "OK") {
            const resultLog = await handleLog(email, document, 'ExitLag', "Reenviar link", "127.0.0.1");

            return "Resended";
        } else {
            return "Error";
        }

    } catch (error) {
        console.log("handleReenviarSP: Erro ao reenviar email do SuperPlayer:", error);
        return null
    }
}


export const handleFixitSP = async (document: string) => {
    try {

    } catch (error) {
        return null
    }
}