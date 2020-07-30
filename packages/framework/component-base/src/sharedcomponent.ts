/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    IComponentHandle,
    IComponentLoadable,
    IComponentRouter,
    IRequest,
    IResponse,
    IProvideComponentHandle,
} from "@fluidframework/component-core-interfaces";
import {
    IFluidDataStoreContext,
} from "@fluidframework/runtime-definitions";
import {
    IFluidDataStoreRuntime,
} from "@fluidframework/component-runtime-definitions";
import { ComponentHandle } from "@fluidframework/component-runtime";
import { ISharedObject } from "@fluidframework/shared-object-base";
import { EventForwarder } from "@fluidframework/common-utils";
import { IEvent } from "@fluidframework/common-definitions";

export abstract class PureDataObject<
    TRoot extends ISharedObject = ISharedObject,
    TEvents extends IEvent = IEvent>
    extends EventForwarder<TEvents>
    implements IComponentLoadable, IProvideComponentHandle, IComponentRouter {
    private _handle?: IComponentHandle<this>;

    public get IComponentRouter() { return this; }
    public get IComponentLoadable() { return this; }
    public get IComponentHandle() { return this.handle; }
    public get IProvideComponentHandle() { return this; }

    /**
     * Handle to a shared component
     */

    protected readonly root: TRoot;

    public constructor(
        protected readonly context: IFluidDataStoreContext,
        protected readonly runtime: IFluidDataStoreRuntime,
        root: ISharedObject,
    ) {
        super();
        this.root = root as TRoot;
    }

    // #region IComponentRouter

    public async request({ url }: IRequest): Promise<IResponse> {
        return url === "" || url === "/"
            ? { status: 200, mimeType: "fluid/component", value: this }
            : { status: 404, mimeType: "text/plain", value: `Requested URL '${url}' not found.` };
    }

    // #endregion IComponentRouter

    // #region IComponentLoadable

    public get handle(): IComponentHandle<this> {
        // Lazily create the ComponentHandle when requested.
        if (!this._handle) {
            this._handle = new ComponentHandle(
                this,
                "",
                this.runtime.IComponentHandleContext);
        }

        return this._handle;
    }

    /**
     * Absolute URL to the component within the document
     */
    public get url() { return this.runtime.IComponentHandleContext.absolutePath; }

    // #endregion IComponentLoadable

    public abstract create(props?: any);
    public abstract async load();
}
