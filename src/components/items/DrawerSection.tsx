import * as React from "react";

export function DrawerSection({
	title,
	action,
	children,
}: {
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="border-b p-4 last:border-b-0">
			<div className="mb-2 flex items-center justify-between">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{title}
				</h3>
				{action}
			</div>
			{children}
		</section>
	);
}
