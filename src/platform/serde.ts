import { Ingestion } from "./ingestion";

export type IngestionModel = {
  offset?: string;
  drugName?: string;
  dosage?: string;
  halfLife?: string;
};

export function encodeHash(input: Array<Ingestion>): string | undefined {
  if (!input.length) {
    return undefined
  }

  try {
    const entries: Array<IngestionModel> = [];

    for (const ingestion of input) {
      entries.push({
        offset: ingestion.offset,
        drugName: ingestion.drugName,
        dosage: ingestion.dosage,
        halfLife: ingestion.halfLife,
      });
    }

    return encodeURIComponent(JSON.stringify(entries));
  } catch (error) {
    console.error("Invalid hash config");
    return;
  }
}

export function decodeHash(input: string): Array<Ingestion> {
  if (!input) {
    return []
  }
  try {
    const decoded: Array<IngestionModel> = JSON.parse(
      decodeURIComponent(input)
    );
    const result: Array<Ingestion> = [];

    for (const ingestion of decoded) {
      result.push(
        Ingestion.new({
          offset: ingestion.offset,
          drugName: ingestion.drugName,
          dosage: ingestion.dosage,
          halfLife: ingestion.halfLife,
        })
      );
    }

    return result;
  } catch (error) {
    console.error("Invalid hash config");
    return [];
  }
}

export function parseFromHash(): [Array<Ingestion>, string] {
  if (!window.location.hash) {
    return [[], ''];
  }

  const encoded = window.location.hash.substring(1);
  return [decodeHash(encoded), encoded];
}

export function storeAsHash(input: Array<Ingestion>): string {
  const result = encodeHash(input);
  if (!result) {
    window.location.hash = ''
    return ''
  }
  window.location.hash = result
  return result
}
