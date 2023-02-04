import {Request, Response, Router} from "express";

import {
    Paginator,
    HTTP_STATUSES,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery, SortDirections
} from "../../types";
import {inputValidationsMiddleware} from "../../middlewares/input-validations-middleware";
import {authorizationGuardMiddleware} from "../../middlewares/authorization-guard-middleware";
import {GetPostOutputModel, GetMappedPostOutputModel} from "../../models/PostModels/GetPostOutputModel";
import {CreatePostInputModel} from "../../models/PostModels/CreatePostInputModel";
import {GetPostInputModel} from "../../models/PostModels/GetPostInputModel";
import {UpdatePostInputModel} from '../../models/PostModels/UpdatePostInputModel';
import {createPostInputValidations} from "../../validations/post/createPostInputValidations";
import {updatePostInputValidations} from "../../validations/post/updatePostInputValidations";
import {paramIdValidationMiddleware} from "../../middlewares/paramId-validation-middleware";
import {postsQueryRepository} from "../../repositories/Queries-repo/posts-query-repository";
import {getMappedBlogViewModel, getMappedPostViewModel} from "../../helpers";
import {postsService} from "../../domain/posts-service";
import {GetPostsInputModel, SortPostsBy} from "../../models/PostModels/GetPostsInputModel";


export const postsRouter = Router({});

postsRouter.get(
    '/',
    async (req: RequestWithQuery<GetPostsInputModel>, res: Response<Paginator<GetMappedPostOutputModel[]>>
    ) => {
        const resData = await postsQueryRepository.getPosts({
            sortBy: (req.query.sortBy?.toString() || 'createdAt') as SortPostsBy, // by-default createdAt
            sortDirection: (req.query.sortDirection?.toString() || SortDirections.desc) as SortDirections, // by-default desc
            pageNumber: +(req.query.pageNumber || 1), // by-default 1
            pageSize: +(req.query.pageSize || 10) // by-default 10
        });
        const {
            pagesCount,
            page,
            pageSize,
            totalCount,
            items
        } = resData || {};
        res.status(HTTP_STATUSES.OK_200).json({
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: items.map(getMappedPostViewModel)
        });
    });
postsRouter.get(
    '/:id([0-9a-f]{24})',
    paramIdValidationMiddleware,
    inputValidationsMiddleware,
    async (req: RequestWithParams<GetPostInputModel>, res: Response<GetPostOutputModel>) => {
        const resData = await postsQueryRepository.findPostById(req.params.id);
        if (!resData) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        res.status(HTTP_STATUSES.OK_200).json(getMappedPostViewModel(resData));
    });

postsRouter.post(
    '/',
    authorizationGuardMiddleware,
    createPostInputValidations,
    inputValidationsMiddleware,
    async (req: RequestWithBody<CreatePostInputModel>, res: Response<GetPostOutputModel>
    ) => {
        const createdPost = await postsService.createPost(req.body);

        // Если указан невалидный blogId
        if (!createdPost) {
            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            return;
        }
        res.status(HTTP_STATUSES.CREATED_201).json(getMappedPostViewModel(createdPost));
    })

postsRouter.put(
    '/:id([0-9a-f]{24})',
    authorizationGuardMiddleware,
    paramIdValidationMiddleware,
    updatePostInputValidations,
    inputValidationsMiddleware,
    async (req: RequestWithParamsAndBody<GetPostInputModel, UpdatePostInputModel>, res: Response
    ) => {
        const isPostUpdated = await postsService.updatePost({id: req.params.id, input: req.body});
        if (!isPostUpdated) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    });

postsRouter.delete(
    '/:id([0-9a-f]{24})',
    authorizationGuardMiddleware,
    paramIdValidationMiddleware,
    async (req: RequestWithParams<GetPostInputModel>, res: Response<void>) => {
        const resData = await postsService.deletePostById(req.params.id);
        if (!resData) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    });
