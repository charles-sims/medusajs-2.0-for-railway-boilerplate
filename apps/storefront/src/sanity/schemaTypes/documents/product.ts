import { ComposeIcon } from "@sanity/icons"
import { DocumentDefinition } from "sanity"

const productSchema: DocumentDefinition = {
  fields: [
    {
      name: "title",
      type: "string",
    },
    {
      name: "productHandle",
      title: "Product Handle",
      type: "string",
      readOnly: true,
    },
    {
      group: "content",
      name: "researchMdx",
      title: "Research MDX",
      description:
        "Product research section rendered on the storefront. Supports the existing CaliLean MDX components.",
      type: "text",
      rows: 30,
    },
    {
      group: "content",
      name: "specs",
      of: [
        {
          fields: [
            { name: "lang", title: "Language", type: "string" },
            { name: "title", title: "Title", type: "string" },
            {
              name: "content",
              rows: 3,
              title: "Content",
              type: "text",
            },
          ],
          name: "spec",
          type: "object",
        },
      ],
      type: "array",
    },
    {
      fields: [
        { name: "title", title: "Title", type: "string" },
        {
          name: "products",
          of: [{ to: [{ type: "product" }], type: "reference" }],
          title: "Addons",
          type: "array",
          validation: (Rule) => Rule.max(3),
        },
      ],
      name: "addons",
      type: "object",
    },
  ],
  name: "product",
  preview: {
    select: {
      title: "title",
    },
  },
  title: "Product Page",
  type: "document",
  groups: [
    {
      default: true,
      // @ts-ignore
      icon: ComposeIcon,
      name: "content",
      title: "Content",
    },
  ],
}

export default productSchema
