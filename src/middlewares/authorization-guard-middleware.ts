import {Request, Response, NextFunction} from "express";

import {HTTP_STATUSES} from '../types';
import {db} from "../store/mockedDB";


export const authorizationGuardMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req?.headers?.authorization;
    if (!token) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTH_401)
        return;
    }

    const splitToken = token.split(' ');
    const authType = splitToken[0];
    const authData = new Buffer(splitToken[1], 'base64')
        .toString('utf-8')
        .split(':');
    const login = authData[0];
    const password = authData[1];

    if (
        authType !== 'Basic' ||
        !db.users.some(user => user.login === login && user.password === password)
    ) {
        res.sendStatus(HTTP_STATUSES.NOT_AUTH_401);
        return;
    }

    next();
};
