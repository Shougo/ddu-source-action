import {
  type Context,
  type DduItem,
  type DduOptions,
  type Item,
} from "jsr:@shougo/ddu-vim@~6.4.0/types";
import { BaseSource } from "jsr:@shougo/ddu-vim@~6.4.0/source";

import type { Denops } from "jsr:@denops/core@~7.0.0";

import { type ActionData } from "../@ddu-kinds/action.ts";

type Params = {
  actions: string[];
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
        const actions = await args.denops.dispatcher.getItemActionNames(
          args.options.name,
          args.sourceParams.items,
        ) as string[];

        controller.enqueue(actions.map((action) => {
          return {
            word: action,
            action: {
              action: action,
              name: args.sourceParams.name,
              items: args.sourceParams.items,
            },
          };
        }));
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      actions: [],
      name: "default",
      items: [],
    };
  }
}
