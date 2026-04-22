import { Response } from "express";

type Client = {
  id: string;
  res: Response;
};

let clients: Client[] = [];

export function addClient(id: string, res: Response) {
  clients.push({ id, res });
}

export function removeClient(id: string) {
  clients = clients.filter(client => client.id !== id);
}

export function broadcast(type: string, data: any) {
  const payload = JSON.stringify({ type, data });
  clients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
}
