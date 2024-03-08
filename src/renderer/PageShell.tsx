export { PageShell };

import React from "react";
import "unfonts.css";
import type { PageContext } from "vike/types";
import "./PageShell.css";
import "./css/index.css";
import { PageContextProvider } from "./usePageContext";

function PageShell({
	children,
	pageContext,
}: { children: React.ReactNode; pageContext: PageContext }) {
	return (
		<React.StrictMode>
			<PageContextProvider pageContext={pageContext}>
				{children}
			</PageContextProvider>
		</React.StrictMode>
	);
}
