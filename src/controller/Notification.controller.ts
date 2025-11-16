import { CreateAccountDTO } from "@dtos/accountDTO";
import { CreateNotificationDTO } from "@dtos/notificationDTO";
import { notificationService } from "@services/index";
import BuilderDTO from "@utils/builderDTO";
import { Request, Response, NextFunction } from "express";

export default class NotificationController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const notifications = await notificationService.getAll();
            res.status(200).json(notifications);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            data.sender = req.account?.id;
            const image = req.file as Express.Multer.File;
            const newNotificationDTO: CreateNotificationDTO = new BuilderDTO<CreateNotificationDTO>(data)
                .add({ key: "sender" })
                .add({ key: "type", required: false })
                .add({ key: "content" })
                .add({ key: "latitude", type: "number" })
                .add({ key: "longitude", type: "number" })
                .build();

            
            await notificationService.create(newNotificationDTO, image);
            res.status(201).json();
        } catch (error) {
            next(error);
        }
    }
}