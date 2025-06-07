import {
  VisualHiveStack,
  type StackableDBComponent,
} from "~/components/hive-stack";

export default function TestPage() {
  const dbHiveComponents: StackableDBComponent[] = [
    {
      identifier: "d1",
      type: "Deckel",
      displayLabel: "Deckel Oben",
      _internal: { virtualPosition: { type: "forceTop", forceFromTop: 0 } },
    },
    {
      identifier: "fd1",
      type: "Futterraum",
      displayLabel: "Futterzarge",
      _internal: { virtualPosition: { type: "forceTop", forceFromTop: 1 } },
    },
    {
      identifier: "k1",
      type: "Königinnenabsperrgitter",
      displayLabel: "Absperrgitter",
    },
    {
      identifier: "z1",
      type: "Zarge",
      displayLabel: "Brutraum",
      frameSize: "Zander",
    },
    {
      identifier: "o1",
      type: "One Way Gate",
      displayLabel: "Bienenflucht",
    },
    {
      identifier: "z2",
      type: "Zarge",
      displayLabel: "Honigraum",
      frameSize: "Dadant Honig",
    },
    {
      identifier: "b1",
      type: "Boden",
      displayLabel: "Gitterboden",
    },
  ] as StackableDBComponent[];

  return (
    <VisualHiveStack
      colonyId="f1"
      components={dbHiveComponents}
      highlightedComponentId="k1"
    />
  );
}