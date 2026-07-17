import type { Context, DduItem, DduOptions, Item } from "@shougo/ddu-vim/types";
import { BaseSource } from "@shougo/ddu-vim/source";

import type { ActionData } from "../../@ddu-kinds/action/main.ts";

import type { Denops } from "@denops/std";

import { is } from "@core/unknownutil/is";

type Params = {
  actions: string[];
  ignoredActions: string[];
  name: string;
  items: DduItem[];
};

export class Source extends BaseSource<Params> {
  override kind = "action";

  override gather(args: {
    denops: Denops;
    context: Context;
    options: DduOptions;
    sourceParams: Params;
  }): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const actions = await getItemActions(
          args.denops,
          args.options.name,
          args.sourceParams.items,
        );

        const actionNames = filterActionNames(
          actions,
          args.sourceParams,
        );

        controller.enqueue(
          actionNames.map((actionName) =>
            toActionItem(
              actionName,
              actions[actionName],
              args.sourceParams.name,
              args.sourceParams.items,
            )
          ),
        );
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      actions: [],
      ignoredActions: [],
      name: "default",
      items: [],
    };
  }
}

async function getItemActions(
  denops: Denops,
  sourceName: string,
  items: DduItem[],
): Promise<Record<string, unknown>> {
  return await denops.dispatcher.getItemActions(
    sourceName,
    items,
  ) as Record<string, unknown>;
}

function filterActionNames(
  actions: Record<string, unknown>,
  params: Params,
): string[] {
  return Object.keys(actions).filter((action) => {
    if (params.actions.length > 0 && !params.actions.includes(action)) {
      return false;
    }

    if (params.ignoredActions.includes(action)) {
      return false;
    }

    return true;
  });
}

function toActionItem(
  actionName: string,
  action: unknown,
  sourceName: string,
  items: DduItem[],
): Item<ActionData> {
  const description = getActionDescription(action);

  return {
    word: description.length === 0
      ? actionName
      : `${actionName} : ${description}`,
    highlights: [{
      name: "actionName",
      hl_group: "Statement",
      col: 1,
      width: actionName.length,
    }],
    action: {
      action: actionName,
      name: sourceName,
      items,
    },
  };
}

function getActionDescription(action: unknown): string {
  if (!is.Record(action)) {
    return "";
  }

  const description = action.description;
  if (typeof description !== "string") {
    return "";
  }

  return description.replaceAll("\n", " ");
}
