import { useFetch } from "#app";

export function useExport() {
  const descargarArchivo = async (
    url: string,
    filename: string,
    fileType = "PDF",
  ) => {
    const auth = useAuthStore();

    try {
      const { data, error } = await useFetch<Blob>(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        responseType: "blob",
      });

      if (error.value) throw error.value;
      if (!data.value) throw new Error("Archivo vacío o no encontrado.");

      const blobUrl = URL.createObjectURL(data.value);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(`Error descargando ${fileType}:`, err);
      throw new Error(`No se pudo descargar el ${fileType}`);
    }
  };

  return { descargarArchivo };
}
