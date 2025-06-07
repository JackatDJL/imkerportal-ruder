import {
  VisualHiveStack,
  type VisualHiveStackProps,
} from "~/components/hive-stack";

export default function TestPage() {
  const props: VisualHiveStackProps = {
    colonyId: "f1",
    components: [
      {
        id: "d1",
        type: "deckel",
        label: "Deckel",
        colour: "#8B4513",
      },
      {
        id: "fd1",
        type: "zarge",
        subtype: "futterzarge",
        label: "Futterzarge",
        colour: "#FF6347",
      },
      {
        id: "z1",
        type: "zarge",
        subtype: "brutraum",
        label: "Brutraum",
        colour: "#FFD700",
      },
      {
        id: "z2",
        type: "zarge",
        subtype: "honigraum",
        label: "Honigraum",
        colour: "#FFA500",
      },
      {
        id: "b1",
        type: "boden",
        label: "Boden",
        colour: "#654321",
      }
    ],
    highlightedComponentId: "b1"
  };
  return <VisualHiveStack {...props} />;
}
