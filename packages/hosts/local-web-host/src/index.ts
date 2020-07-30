/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LocalDocumentServiceFactory, LocalResolver } from "@fluidframework/local-driver";
import { LocalDeltaConnectionServer } from "@fluidframework/server-local-server";
import { v4 as uuid } from "uuid";
import {
    IProxyLoaderFactory,
    ICodeLoader,
    IProvideRuntimeFactory,
    IFluidModule,
    IFluidCodeDetails,
} from "@fluidframework/container-definitions";
import { Loader, Container } from "@fluidframework/container-loader";
import { IProvideComponentFactory } from "@fluidframework/runtime-definitions";
import { IComponent, IFluidObject } from "@fluidframework/component-core-interfaces";
import { ContainerRuntimeFactoryWithDefaultDataStore } from "@fluidframework/aqueduct";
import { initializeContainerCode } from "@fluidframework/base-host";
import { HTMLViewAdapter } from "@fluidframework/view-adapters";

export async function createLocalContainerFactory(
    entryPoint: Partial<IProvideRuntimeFactory & IProvideComponentFactory & IFluidModule>,
): Promise<() => Promise<Container>> {
    const urlResolver = new LocalResolver();

    const deltaConn = LocalDeltaConnectionServer.create();
    const documentServiceFactory = new LocalDocumentServiceFactory(deltaConn);

    const factory: Partial<IProvideRuntimeFactory & IProvideComponentFactory> =
        entryPoint.fluidExport ? entryPoint.fluidExport : entryPoint;

    const runtimeFactory: IProvideRuntimeFactory =
        factory.IRuntimeFactory ?
            factory.IRuntimeFactory :
            new ContainerRuntimeFactoryWithDefaultDataStore(
                "default",
                [["default", Promise.resolve(factory.IComponentFactory)]],
            );

    const codeLoader: ICodeLoader = {
        load: async <T>() => ({ fluidExport: runtimeFactory } as unknown as T),
    };

    const loader = new Loader(
        urlResolver,
        documentServiceFactory,
        codeLoader,
        {},
        {},
        new Map<string, IProxyLoaderFactory>());

    const documentId = uuid();
    const url = `fluid://localhost/${documentId}`;

    return async () => {
        const container = await loader.resolve({ url });

        await initializeContainerCode(container, {} as any as IFluidCodeDetails);

        // If we're loading from ops, the context might be in the middle of reloading.  Check for that case and wait
        // for the contextChanged event to avoid returning before that reload completes.
        if (container.hasNullRuntime()) {
            await new Promise<void>((resolve) => container.once("contextChanged", () => resolve()));
        }

        return container;
    };
}

export async function renderDefaultComponent(container: Container, div: HTMLElement) {
    const response = await container.request({ url: "" });

    if (response.status !== 200 ||
        !(
            response.mimeType === "fluid/component" ||
            response.mimeType === "fluid/object"
        )) {
        div.innerText = "Component not found";
        return;
    }

    // Render the component with an HTMLViewAdapter to abstract the UI framework used by the component
    const component = response.value as IComponent & IFluidObject;
    const embed = new HTMLViewAdapter(component);
    embed.render(div, { display: "block" });
}
