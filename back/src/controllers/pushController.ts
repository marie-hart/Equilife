import { Request, Response } from "express";
import {
  getPublicKey,
  saveSubscription,
} from "../services/pushService";

class PushController {
  getPublicKey(req: Request, res: Response) {
    const key = getPublicKey();
    if (!key) {
      return res.status(500).json({ error: "VAPID keys are not configured" });
    }
    return res.json({ publicKey: key });
  }

  async subscribe(req: Request, res: Response) {
    try {
      await saveSubscription(req.body);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: "Failed to save subscription" });
    }
  }
}

export default new PushController();
