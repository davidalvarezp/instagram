/**
 * Este script fue desarrollado por David Alvarez (davidalvarezp.com).
 * Su uso está sujeto a créditos mencionando a los autores.
 * 
 * Descripción: Analiza las listas de seguidores y seguidos de Instagram
 * para identificar quiénes no te siguen de vuelta, a quiénes no sigues
 * de vuelta y usuarios con seguimiento mutuo.
 */

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const zipFile = document.getElementById("zipFile").files[0];
    if (!zipFile) {
        alert("Por favor, selecciona un archivo ZIP.");
        return;
    }

    try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);

        const followersPath = "connections/followers_and_following/followers_1.json";
        const followingPath = "connections/followers_and_following/following.json";

        const followersFile = zipContent.file(followersPath);
        const followingFile = zipContent.file(followingPath);

        if (!followersFile || !followingFile) {
            alert("No se encontraron los archivos necesarios en el ZIP.");
            return;
        }

        const followersData = await followersFile.async("string");
        const followingData = await followingFile.async("string");

        const followersJSON = JSON.parse(followersData);
        const followingJSON = JSON.parse(followingData);

        const extractUsernames = (data) =>
            data
                .filter((entry) => entry.string_list_data && entry.string_list_data[0])
                .map((entry) => entry.string_list_data[0].value);

        const followersSet = new Set(extractUsernames(followersJSON || []));
        const followingSet = new Set(extractUsernames(followingJSON["relationships_following"] || []));

        const notFollowingBack = Array.from(followingSet)
            .filter(user => user !== "davidalvarezzp" && !followersSet.has(user))
            .sort();
        
        const notFollowingYou = Array.from(followersSet)
            .filter(user => !followingSet.has(user))
            .sort();
        
        const mutualFollowers = Array.from(followersSet)
            .filter(user => followingSet.has(user))
            .sort();

        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
            <h3>Personas que sigues y no te siguen:</h3>
            <ul>${notFollowingBack.map(user => `<li>${user}</li>`).join("")}</ul>

            <h3>Personas que te siguen y no sigues:</h3>
            <ul>${notFollowingYou.map(user => `<li>${user}</li>`).join("")}</ul>

            <h3>Personas que os seguís mutuamente:</h3>
            <ul>${mutualFollowers.map(user => `<li>${user}</li>`).join("")}</ul>
        `;

        const downloadButtons = document.getElementById("downloadButtons");
        downloadButtons.style.display = "block";

        const createAndDownloadFile = (filename, content) => {
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        };

        document.getElementById("downloadNotFollowingBack").onclick = () => {
            createAndDownloadFile("no_te_siguen.txt", notFollowingBack.join("\n"));
        };
        document.getElementById("downloadNotFollowingYou").onclick = () => {
            createAndDownloadFile("no_los_sigues.txt", notFollowingYou.join("\n"));
        };
        document.getElementById("downloadMutualFollowers").onclick = () => {
            createAndDownloadFile("follow_mutuo.txt", mutualFollowers.join("\n"));
        };

    } catch (error) {
        console.error("Error al procesar el archivo ZIP:", error);
        alert("Hubo un error al procesar el archivo ZIP. Revisa la consola para más detalles.");
    }
});
