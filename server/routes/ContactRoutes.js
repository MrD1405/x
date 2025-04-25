import { getAllContacts, getContactsForDMList, searchContacts } from "../controllers/ContactController.js";
import { Router } from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);
contactsRoutes.get("/get-contacts-for-dm", verifyToken,getContactsForDMList);
contactsRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactsRoutes;