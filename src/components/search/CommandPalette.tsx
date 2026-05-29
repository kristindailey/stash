"use client";

import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { ITEM_TYPE_COLORS, ITEM_TYPE_ICONS } from "@/lib/constants/item-types";
import { useItemDrawer } from "@/components/items/item-drawer-context";
import { useCommandPalette } from "./command-palette-context";
import type { SearchData } from "@/lib/db/search";

export function CommandPalette({ data }: { data: SearchData }) {
	const router = useRouter();
	const { open, setOpen } = useCommandPalette();
	const { openItem } = useItemDrawer();

	function handleSelectItem(id: string) {
		setOpen(false);
		openItem(id);
	}

	function handleSelectCollection(id: string) {
		setOpen(false);
		router.push(`/collections/${id}`);
	}

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Search items, collections, tags…" />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>

				{data.items.length > 0 && (
					<CommandGroup heading="Items">
						{data.items.map((item) => {
							const Icon = ITEM_TYPE_ICONS[item.type] ?? FolderOpen;
							const color = ITEM_TYPE_COLORS[item.type];
							return (
								<CommandItem
									key={item.id}
									value={item.id}
									keywords={[item.title, item.type, item.preview ?? ""]}
									onSelect={() => handleSelectItem(item.id)}
								>
									<Icon style={color ? { color } : undefined} />
									<span className="truncate">{item.title}</span>
									{item.preview && (
										<span className="ml-2 truncate text-xs text-muted-foreground">
											{item.preview}
										</span>
									)}
								</CommandItem>
							);
						})}
					</CommandGroup>
				)}

				{data.collections.length > 0 && (
					<CommandGroup heading="Collections">
						{data.collections.map((collection) => (
							<CommandItem
								key={collection.id}
								value={collection.id}
								keywords={[collection.name]}
								onSelect={() => handleSelectCollection(collection.id)}
							>
								<FolderOpen />
								<span className="truncate">{collection.name}</span>
								<span className="ml-auto text-xs text-muted-foreground">
									{collection.itemCount}{" "}
									{collection.itemCount === 1 ? "item" : "items"}
								</span>
							</CommandItem>
						))}
					</CommandGroup>
				)}
			</CommandList>
		</CommandDialog>
	);
}
