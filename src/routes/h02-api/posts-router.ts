import {Request, Response, Router} from "express";

import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types";
import {inputValidationsMiddleware} from "../../middlewares/input-validations-middleware";
import {authorizationGuardMiddleware} from "../../middlewares/authorization-guard-middleware";
import {postsRepository} from "../../repositories/posts-repository";
import {GetPostOutputModel} from "../../models/PostModels/GetPostOutputModel";
import {getDeletePostInputValidations} from "../../validations/post/getDeletePostInputValidations";
import {CreatePostInputModel} from "../../models/PostModels/CreatePostInputModel";
import {GetPostInputModel} from "../../models/PostModels/GetPostInputModel";
import {UpdatePostInputModel} from '../../models/PostModels/UpdatePostInputModel';
import {createPostInputValidations} from "../../validations/post/createPostInputValidations";
import {updatePostInputValidations} from "../../validations/post/updatePostInputValidations";


export const postsRouter = Router({});

postsRouter.get(
    '/',
    async (req: Request, res: Response<GetPostOutputModel[]>
    ) => {
        const resData = await postsRepository.getPosts();
        res.json(resData);
    });
postsRouter.get(
    '/:id',
    getDeletePostInputValidations,
    inputValidationsMiddleware,
    async (req: RequestWithParams<GetPostInputModel>, res: Response<GetPostOutputModel>) => {
        const resData = await postsRepository.findPostById(req.params.id);
        if (!resData) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        res.json(resData);
    });

postsRouter.post(
    '/',
    authorizationGuardMiddleware,
    createPostInputValidations,
    inputValidationsMiddleware,
    async (req: RequestWithBody<CreatePostInputModel>, res: Response<GetPostOutputModel>
    ) => {
        const createdPost = await postsRepository.createPost(req.body);

        // Если указан невалидный blogId
        if (!createdPost) {
            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            return;
        }
        res.status(HTTP_STATUSES.CREATED_201).json(createdPost);
    })

postsRouter.put(
    '/:id',
    authorizationGuardMiddleware,
    updatePostInputValidations,
    inputValidationsMiddleware,
    async (req: RequestWithParamsAndBody<GetPostInputModel, UpdatePostInputModel>, res: Response
    ) => {
        const isPostUpdated = await postsRepository.updatePost({id: req.params.id, input: req.body});
        if (!isPostUpdated) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    });

postsRouter.delete(
    '/:id',
    authorizationGuardMiddleware,
    getDeletePostInputValidations,
    inputValidationsMiddleware,
    async (req: RequestWithParams<GetPostInputModel>, res: Response<void>) => {
        const resData = await postsRepository.deletePostById(req.params.id);
        if (!resData) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    });
