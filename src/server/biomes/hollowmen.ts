import { BiomeSpec } from "../core/biome";
import { fill } from "../../lib/utils";

// unused
// [...fill(10).of("╭"), ...fill(10).of("╯"), ...fill(10).of("╮"), ...fill(10).of("╰")],
//  ...fill(10).of("෴")
// ...fill(4).of("𐁗"),

export const hollowmen: BiomeSpec = {
  name: "hollowmen",

  parameters: {
    scaleFactor: { x: 24, y: 24 },

    pathCeiling: 0,
    ambianceCeiling: 0.35,
    rareFloor: 0.9,
  },

  ambiance: [
    [...fill(50).of("."), ...fill(10).of("𑀇")],
    [...fill(10).of("𐂩"), ...fill(4).of("𐂷")],
    [...fill(4).of("𐃦"), ...fill(4).of("ඉ"), ...fill(4).of("ළ"), ...fill(4).of("ඝ")],
  ],
  rares: {
    a: "ȃ",
    b: "ᗾ",
    c: "ᙅ",
    d: "ᗥ",
    e: "ᘍ",
    f: "ʄ",
    h: "ʯ",
    j: "ǰ",
    m: "ᙢ",
    o: "ㆆ",
    p: "Ᵽ",
    s: "ᔖ",
    u: "u𑨶",
  },
  structures: [
    "We are the hollow men",
    "We are the stuffed men",
    "Shape without form",
    "shade without colour",
    "Paralysed force",
    "gesture without motion",
    "not as lost Violent souls",
    "In death's dream kingdom",
    "Rat's coat crowskin crossed staves",
    "Behaving as the wind behaves",
    "Not that final meeting",
    "In the twilight kingdom",
    "This is the dead land This is cactus land",
    "Here the stone images Are raised",
    "The supplication of a dead man's hand",
    "Under the twinkle of a fading star",
    "Waking alone",
    "Trembling with tenderness",
    "Form prayers to broken stone",
    "The eyes are not here",
    "There are no eyes here",
    "In this valley of dying stars",
    "This broken jaw of our lost kingdoms",
    "In this last of meeting places",
    "Here we go round the prickly pear",
    "This is the way the world ends",
    "This is the way the world ends",
    "This is the way the world ends",
    "Not with a bang but a whimper",
  ],
  txt: `Mistah Kurtz he dead
  A penny for the Old Guy
  We are the hollow men
  We are the stuffed men
  Leaning together
  Headpiece filled with straw Alas
  Our dried voices when
  We whisper together
  Are quiet and meaningless
  As wind in dry grass
  Or rats' feet over broken glass
  In our dry cellar
  Shape without form shade without colour
  Paralysed force gesture without motion;
  Those who have crossed
  With direct eyes to death's other Kingdom
  Remember us if at all not as lost
  Violent souls but only
  As the hollow men
  The stuffed men
  Eyes I dare not meet in dreams
  In death's dream kingdom
  These do not appear:
  There the eyes are
  Sunlight on a broken column
  There is a tree swinging
  And voices are
  In the wind's singing
  More distant and more solemn
  Than a fading star
  Let me be no nearer
  In death's dream kingdom
  Let me also wear
  Such deliberate disguises
  Rat's coat crowskin crossed staves
  In a field
  Behaving as the wind behaves
  No nearer 
  Not that final meeting
  In the twilight kingdom
  This is the dead land
  This is cactus land
  Here the stone images
  Are raised here they receive
  The supplication of a dead man's hand
  Under the twinkle of a fading star
  Is it like this
  In death's other kingdom
  Waking alone
  At the hour when we are
  Trembling with tenderness
  Lips that would kiss
  Form prayers to broken stone
  The eyes are not here
  There are no eyes here
  In this valley of dying stars
  In this hollow valley
  This broken jaw of our lost kingdoms
  In this last of meeting places
  We grope together
  And avoid speech
  Gathered on this beach of the tumid river
  Sightless unless
  The eyes reappear
  As the perpetual star
  Multifoliate rose
  Of death's twilight kingdom
  The hope only
  Of empty men
  Here we go round the prickly pear
  Prickly pear prickly pear
  Here we go round the prickly pear
  At five o'clock in the morning
  Between the idea
  And the reality
  Between the motion
  And the act
  Falls the Shadow
  For Thine is the Kingdom
  Between the conception
  And the creation
  Between the emotion
  And the response
  Falls the Shadow
  Life is very long
  Between the desire
  And the spasm
  Between the potency
  And the existence
  Between the essence
  And the descent
  Falls the Shadow
  For Thine is the Kingdom
  For Thine is
  Life is
  For Thine is the
  This is the way the world ends
  This is the way the world ends
  This is the way the world ends
  Not with a bang but a whimper`,
};
