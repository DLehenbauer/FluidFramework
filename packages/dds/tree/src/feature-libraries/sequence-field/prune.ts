/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { Changeset } from "./types.js";
import { MarkListFactory } from "./markListFactory.js";
import { withNodeChange } from "./utils.js";
import { VestigialEndpoint, isVestigialEndpoint } from "./helperTypes.js";

export type NodeChangePruner<TNodeChange> = (change: TNodeChange) => TNodeChange | undefined;

export function prune<TNodeChange>(
	changeset: Changeset<TNodeChange>,
	pruneNode: NodeChangePruner<TNodeChange>,
): Changeset<TNodeChange> {
	const pruned = new MarkListFactory<TNodeChange>();
	for (let mark of changeset) {
		if (isVestigialEndpoint(mark)) {
			delete (mark as Partial<VestigialEndpoint>).vestigialEndpoint;
		}
		if (mark.changes !== undefined) {
			mark = withNodeChange(mark, pruneNode(mark.changes));
		}
		pruned.push(mark);
	}
	return pruned.list;
}
