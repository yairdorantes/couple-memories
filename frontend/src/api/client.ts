import { apiBaseUrl } from "../config/api";
import { getStoredCurrentPerson } from "../identity/currentPersonStorage";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${apiBaseUrl}${path}`);

  Object.entries(options.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const headers = new Headers(options.headers);
  if (!headers.has("X-Couple-Member-Role")) {
    headers.set("X-Couple-Member-Role", getStoredCurrentPerson());
  }
  const hasBody = options.body !== undefined;
  if (hasBody && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorDetail(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function uploadFile<T>(
  path: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", `${apiBaseUrl}${path}`);
    request.setRequestHeader("X-Couple-Member-Role", getStoredCurrentPerson());

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(JSON.parse(request.responseText) as T);
        return;
      }
      reject(new ApiError(request.status, getXhrErrorDetail(request.responseText)));
    });

    request.addEventListener("error", () => {
      reject(new ApiError(0, "Network error while uploading media."));
    });

    request.send(formData);
  });
}

async function getErrorDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") {
      return body.detail;
    }
    return "Request failed.";
  } catch {
    return response.statusText || "Request failed.";
  }
}

function getXhrErrorDetail(responseText: string): string {
  try {
    const body = JSON.parse(responseText) as { detail?: string };
    return body.detail ?? "Upload failed.";
  } catch {
    return "Upload failed.";
  }
}
