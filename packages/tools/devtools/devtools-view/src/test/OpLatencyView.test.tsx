/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

// eslint-disable-next-line import/no-unassigned-import
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import { MessageRelayContext } from "../MessageRelayContext";
import { OpLatencyView } from "../components";
import { MockMessageRelay } from "./MockMessageRelay";

// ResizeObserver is a hook used by Recharts that needs to be mocked for unit tests to function.
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

describe("OpLatencyView component tests", () => {
	it("Renders as expected when unsampled telemetry is enabled in localStorage", async (): Promise<void> => {
		window.localStorage.setItem("Fluid.Telemetry.DisableSampling", "true");
		render(
			<MessageRelayContext.Provider value={new MockMessageRelay(() => undefined)}>
				<OpLatencyView />
			</MessageRelayContext.Provider>,
		);

		// Check that outermost component container exists
		const opLatencyMainContainerElement = await screen.findByTestId("test-op-latency-view");
		expect(opLatencyMainContainerElement).not.toBeNull();
		expect(opLatencyMainContainerElement).toBeDefined();

		// Check that graph title exists as a header component
		const opLatencyHeaderElement = await screen.findByText("Op Latency");
		expect(opLatencyHeaderElement).not.toBeNull();
		expect(opLatencyHeaderElement).toBeDefined();
		expect(opLatencyHeaderElement.tagName).toMatch(/h[1-6]/i);

		// Confirm the rechart graph was rendered
		const dynamicComposedChartElement = within(opLatencyMainContainerElement).findByTestId(
			"test-dynamic-composed-chart",
		);
		expect(dynamicComposedChartElement).not.toBeNull();
		expect(dynamicComposedChartElement).toBeDefined();

		// Confirm helper text header exists
		const aboutHeader = await screen.findByText("About");
		expect(aboutHeader).not.toBeNull();
		expect(aboutHeader).toBeDefined();
	});

	it("Renders as expected when unsampled telemetry is disabled in localStorage", async (): Promise<void> => {
		window.localStorage.setItem("Fluid.Telemetry.DisableSampling", "false");
		render(
			<MessageRelayContext.Provider value={new MockMessageRelay(() => undefined)}>
				<OpLatencyView />
			</MessageRelayContext.Provider>,
		);

		// Check that graph title exists as a header component
		const opLatencyHeaderElement = await screen.findByText("Op Latency");
		expect(opLatencyHeaderElement).not.toBeNull();
		expect(opLatencyHeaderElement).toBeDefined();

		// Confirm helper text header exists
		const instructionsText = await screen.findByText(
			`localStorage.setItem("Fluid.Telemetry.DisableSampling", "true");`,
		);
		expect(instructionsText).not.toBeNull();
		expect(instructionsText).toBeDefined();
	});
});
