import { useState, useEffect, useCallback } from "react";
import { sdk } from "../lib/sdk";

export const useTriggerSanityProductSync = (id: string) => {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (_?: undefined) => {
    setIsPending(true);
    try {
      await sdk.client.fetch(`/admin/sanity/documents/${id}/sync`, {
        method: "post",
      });
    } finally {
      setIsPending(false);
    }
  }, [id]);

  return { mutateAsync, isPending };
};

export const useSanityDocument = (id: string) => {
  const [sanity_document, setSanityDocument] = useState<Record<string, any> | null>(null);
  const [studio_url, setStudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    sdk.client.fetch<{ sanity_document: any; studio_url: string }>(
      `/admin/sanity/documents/${id}`
    ).then((res) => {
      setSanityDocument(res.sanity_document);
      setStudioUrl(res.studio_url);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [id]);

  return { sanity_document, studio_url, isLoading };
};

export const useTriggerSanitySync = () => {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async () => {
    setIsPending(true);
    try {
      await sdk.client.fetch(`/admin/sanity/syncs`, { method: "post" });
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutateAsync, isPending };
};

export const useSanitySyncs = () => {
  const [workflow_executions, setWorkflowExecutions] = useState<Record<string, any>[]>([]);

  const fetchSyncs = useCallback(() => {
    sdk.client.fetch<{ workflow_executions: Record<string, any>[] }>(
      `/admin/sanity/syncs`
    ).then((res) => {
      setWorkflowExecutions(res.workflow_executions);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchSyncs() }, [fetchSyncs]);

  return { workflow_executions, refetch: fetchSyncs };
};
