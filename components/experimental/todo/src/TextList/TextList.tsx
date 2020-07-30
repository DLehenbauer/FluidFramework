/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DataObject } from "@fluidframework/aqueduct";
import { IDirectory } from "@fluidframework/map";
import { SharedString } from "@fluidframework/sequence";
import { IComponentHTMLView } from "@fluidframework/view-interfaces";
import React from "react";
import ReactDOM from "react-dom";
import { TextListView } from "./TextListView";

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const pkg = require("../../package.json");
export const TextListName = `${pkg.name as string}-textlist`;

/**
 * TextBox is a really simple component that uses the CollaborativeTextArea to provide a
 * collaborative textarea.
 */
export class TextList extends DataObject implements IComponentHTMLView {
    public get IComponentHTMLView() { return this; }

    private textDirectory: IDirectory;

    /**
     * Do creation work
     */
    protected async initializingFirstTime(_props?: any) {
        this.textDirectory = this.root.createSubDirectory("textDirectory");

        // We want to populate the list of items with an initial shared string
        this.createNewItem();
    }

    protected async initializingFromExisting() {
        this.textDirectory = this.root.getSubDirectory("textDirectory");
    }

    protected async hasInitialized() {
        console.log("hasInitialized setting listener");
        this.runtime.on("op", (e) => {
            console.log(JSON.stringify(e));
        });
    }

    // start IComponentHTMLView

    public render(div: HTMLElement) {
        ReactDOM.render(
            <TextListView
                textDirectory={this.textDirectory}
                root={this.root}
                createNewItem={this.createNewItem.bind(this)} />,
            div,
        );
    }

    // end IComponentHTMLView

    private createNewItem() {
        const uniqueId = this.createUniqueItemId();
        const initialSharedString = SharedString.create(this.runtime);
        initialSharedString.insertText(0, `item ${[...this.textDirectory.keys()].length + 1}`);
        this.textDirectory.set(uniqueId, initialSharedString.handle);
    }

    private createUniqueItemId() {
        return `SharedString-${Date.now().toString()}`;
    }
}
