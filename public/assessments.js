// Two extra assessments, shared by the browser and the server.
//
// 1) จุดแข็ง (Strengths): 12 strengths in 4 groups, measured with 24 forced-choice
//    pairs ("which is more like you"). Every strength appears in exactly 4 pairs, against 4 different
//    strengths. Forced choice avoids the "agree with everything" problem of rating scales.
//    Written for Payso; this is NOT Gallup CliftonStrengths and uses none of its theme names.
//
// 2) บุคลิก 4 ตัวอักษร (4-letter type): 4 axes x 5 items, MBTI-style letters (E/I, S/N, T/F, J/P).
//    5 items per axis means a tie is impossible. Written for Payso; this is NOT the official MBTI®.
//
// Answer scale for both: 1..4 = ซ้ายมาก, ค่อนข้างซ้าย, ค่อนข้างขวา, ขวามาก (same UI as Social Style).
(function (root) {
  // ---------------- strengths ----------------
  // The 4 groups follow the same split as Gallup's 4 CliftonStrengths domains
  // (Executing / Influencing / Relationship Building / Strategic Thinking), in our own words.
  const GROUPS = {
    do:    { th: "ลงมือทำ",          en: "Get it done" },
    move:  { th: "ขับเคลื่อนคน",      en: "Move people" },
    care:  { th: "สร้างความสัมพันธ์",  en: "Build relationships" },
    think: { th: "คิดเชิงกลยุทธ์",     en: "Think it through" },
  };

  const STRENGTHS = {
    closer: { group: "do", th: "ผู้ปิดงาน", en: "Closer",
      desc: "มีแรงขับให้งานจบ ตั้งเป้าแล้วต้องไปให้ถึง",
      use: "ให้ถือเป้าที่วัดผลได้ชัด และงานที่ต้องปิดให้ทันกำหนด",
      watch: "อาจรีบจนข้ามรายละเอียด หรือกดดันคนที่ทำงานช้ากว่า",
      s: ["ตั้งเป้าอะไรไว้แล้วต้องไปให้ถึง ไม่ถึงไม่เลิก",
          "รู้สึกดีที่สุดตอนได้ทำอะไรสักอย่างจนเสร็จ",
          "ทำอะไรเร็ว ชอบเห็นความคืบหน้าทุกวัน",
          "มีลิสต์สิ่งที่ต้องทำแล้วอยากติ๊กให้หมดในวันนั้น"] },
    organizer: { group: "do", th: "ผู้วางระบบ", en: "Organizer",
      desc: "จัดขั้นตอนและข้อมูลให้เป็นระบบ ทำให้งานเดินได้แม้ไม่มีตัวเอง",
      use: "ให้ออกแบบ process, checklist, template และดูแล pipeline",
      watch: "อาจติดกับขั้นตอนจนไม่ยืดหยุ่นเมื่อสถานการณ์เปลี่ยน",
      s: ["ชอบจัดสิ่งต่างๆ ให้เป็นระบบ ใครมาใช้ต่อก็เข้าใจ",
          "เจอเรื่องที่ต้องทำซ้ำๆ แล้วอยากหาวิธีที่เป็นระบบ",
          "วางแผนล่วงหน้าว่าจะทำอะไร เมื่อไหร่ ใครทำอะไร",
          "จัดบ้าน ข้าวของ และไฟล์ในเครื่องให้เป็นระเบียบเสมอ"] },
    dependable: { group: "do", th: "ผู้ไว้ใจได้", en: "Dependable",
      desc: "รับปากแล้วทำให้ครบ เป็นคนที่ทีมฝากงานสำคัญได้",
      use: "ให้ดูแลลูกค้าสำคัญหรืองานที่พลาดไม่ได้",
      watch: "อาจรับงานเกินตัวเพราะไม่อยากปฏิเสธ",
      s: ["รับปากใครไว้ ทำให้ครบตามที่พูดเสมอ",
          "คนรอบตัวมักฝากเรื่องสำคัญไว้กับฉัน เพราะมั่นใจว่าไม่หลุด",
          "ถ้าอะไรพลาดเพราะฉัน ฉันจะรีบรับผิดชอบและแก้ให้จบ",
          "ตามเรื่องที่ค้างอยู่จนปิดได้จริง ไม่ปล่อยทิ้งไว้"] },
    persuader: { group: "move", th: "นักโน้มน้าว", en: "Persuader",
      desc: "พูดให้คนเห็นคุณค่าและตัดสินใจ ไม่ถอยง่ายเมื่อเจอคำปฏิเสธ",
      use: "ให้ปิดดีลที่ลูกค้าลังเล นำเสนองาน และต่อรอง",
      watch: "อาจดันจนลูกค้ารู้สึกถูกกดดัน ควรฟังให้ครบก่อน",
      s: ["ชอบเปลี่ยนใจคนที่ยังลังเลให้ตัดสินใจ",
          "เล่าว่าอะไรดียังไง แล้วคนฟังอยากลองตาม",
          "ถูกปฏิเสธแล้วยังหาทางคุยต่อได้",
          "ต่อรองแล้วมักได้ข้อตกลงที่ดีกับทุกฝ่าย"] },
    connector: { group: "move", th: "ผู้เปิดประตู", en: "Connector",
      desc: "สร้างความสัมพันธ์ใหม่ได้เร็ว รู้จักคนเยอะ",
      use: "ให้หาลูกค้าใหม่ ออกงานอีเวนต์ และสร้าง partner",
      watch: "อาจเปิดความสัมพันธ์ไว้เยอะแต่ตามต่อไม่ทั่ว ควรคู่กับระบบติดตาม",
      s: ["เจอคนแปลกหน้าแล้วชวนคุยจนสนิทได้เร็ว",
          "รู้จักคนเยอะ และชอบแนะนำคนให้รู้จักกัน",
          "ไปงานหรือกิจกรรมแล้วได้เพื่อนใหม่กลับมาเสมอ",
          "ทักคนที่ไม่รู้จักก่อนได้โดยไม่เขิน"] },
    captain: { group: "move", th: "ผู้นำทัพ", en: "Captain",
      desc: "กล้าตัดสินใจ กล้าพูดเรื่องยาก และพาทีมไปข้างหน้า",
      use: "ให้นำโปรเจกต์ จัดการวิกฤต และเจรจาเรื่องที่ตึงเครียด",
      watch: "อาจตัดสินใจแทนคนอื่นเร็วเกินไป ควรเปิดให้ทีมได้ออกความเห็น",
      s: ["ตอนสถานการณ์วุ่นวาย ฉันมักเป็นคนตัดสินใจว่าจะไปทางไหน",
          "กล้าพูดเรื่องยากตรงๆ เมื่อจำเป็น",
          "ชอบรับผิดชอบเรื่องใหญ่และพาคนอื่นไปให้ถึง",
          "ถ้าไม่มีใครนำ ฉันจะเป็นคนลุกขึ้นนำเอง"] },
    listener: { group: "care", th: "ผู้เข้าใจคน", en: "Listener",
      desc: "อ่านความรู้สึกคนเก่ง ฟังจนเข้าใจปัญหาจริง",
      use: "ให้ดูแลลูกค้าที่มีปัญหา ทำ discovery และงานบริการหลังการขาย",
      watch: "อาจรับอารมณ์คนอื่นมาจนเหนื่อย ควรมีเวลาพักใจ",
      s: ["อ่านออกว่าคนอื่นรู้สึกยังไง แม้เขาไม่ได้พูดออกมา",
          "คนมักมาระบายหรือปรึกษาเรื่องต่างๆ กับฉัน",
          "ฟังจนเข้าใจปัญหาจริงก่อนจะให้คำแนะนำ",
          "รู้ว่าคนใกล้ตัวกำลังเครียด ก่อนเขาจะบอก"] },
    teamglue: { group: "care", th: "กาวของทีม", en: "Team Glue",
      desc: "ทำให้ทีมเข้ากันได้ หาจุดที่ทุกฝ่ายตกลงกันได้",
      use: "ให้ประสานงานข้ามทีม และช่วยตอนทีมเห็นไม่ตรงกัน",
      watch: "อาจเลี่ยงความขัดแย้งที่ควรคุยให้จบ",
      s: ["ช่วยไกล่เกลี่ยตอนคนรอบตัวเห็นไม่ตรงกัน",
          "อยากให้ทุกคนในกลุ่มรู้สึกเป็นส่วนหนึ่ง ไม่มีใครถูกทิ้ง",
          "เป็นคนนัดรวมกลุ่มหรือชวนทุกคนทำอะไรด้วยกัน",
          "หาจุดที่ทุกฝ่ายตกลงกันได้ แทนที่จะเลือกข้าง"] },
    coach: { group: "care", th: "ผู้ปั้นคน", en: "Coach",
      desc: "เห็นศักยภาพในตัวคน และช่วยให้เขาเก่งขึ้น",
      use: "ให้เป็นพี่เลี้ยงน้องใหม่ ทำ onboarding และสอนงาน",
      watch: "อาจใช้เวลากับคนอื่นจนงานตัวเองล่าช้า",
      s: ["ชอบสอนคนอื่นจนเขาทำเองได้",
          "เห็นศักยภาพในตัวคนอื่นที่เขาเองยังไม่เห็น",
          "ดีใจกับความสำเร็จของคนที่ฉันเคยช่วย มากกว่าของตัวเอง",
          "ให้คำแนะนำที่ช่วยให้คนอื่นเก่งขึ้นได้จริง"] },
    datareader: { group: "think", th: "นักอ่านตัวเลข", en: "Data Reader",
      desc: "ตัดสินใจด้วยข้อมูล จับความผิดปกติในตัวเลขได้เร็ว",
      use: "ให้ทำรายงาน วิเคราะห์ยอด และวัดผลแคมเปญ",
      watch: "อาจรอข้อมูลครบจนตัดสินใจช้า",
      s: ["ก่อนตัดสินใจ ฉันอยากเห็นตัวเลขหรือข้อมูลก่อนเสมอ",
          "เปรียบเทียบราคา รีวิว และสเปกอย่างละเอียดก่อนซื้อของ",
          "ชอบหาสาเหตุว่าทำไมเรื่องนั้นถึงเกิดขึ้น",
          "ตั้งคำถามกับข้อมูลหรือข่าวที่ดูดีเกินจริง"] },
    navigator: { group: "think", th: "นักวางเกม", en: "Navigator",
      desc: "มองเห็นหลายทางเลือกและความเสี่ยงล่วงหน้า แล้วเลือกทางที่คุ้มที่สุด",
      use: "ให้วางแผนบัญชีลูกค้าใหญ่ วางกลยุทธ์ และเตรียมแผนสำรอง",
      watch: "อาจคิดหลายทางจนคนอื่นตามไม่ทัน ควรสรุปให้สั้น",
      s: ["มองออกว่าเรื่องนี้จะไปจบตรงไหน แล้ววางทางไว้ก่อน",
          "เห็นหลายทางเลือก และเลือกทางที่คุ้มที่สุดได้เร็ว",
          "ชอบคิดว่าอีก 1 ปีหรือ 5 ปี ชีวิตจะเป็นยังไง",
          "มองเห็นสิ่งที่อาจผิดพลาดล่วงหน้า แล้วเตรียมแผนสำรอง"] },
    creator: { group: "think", th: "นักสร้างไอเดีย", en: "Creator",
      desc: "คิดไอเดียใหม่ได้เรื่อยๆ ไม่ชอบทำแบบเดิม",
      use: "ให้คิดแคมเปญ คอนเทนต์ และวิธีขายใหม่ๆ",
      watch: "อาจเริ่มหลายเรื่องแต่ปิดไม่ครบ ควรจับคู่กับคนที่ถนัดลงมือทำ",
      s: ["คิดไอเดียใหม่ๆ ได้เรื่อยๆ",
          "ชอบลองทำสิ่งที่คนรอบตัวยังไม่เคยทำ",
          "เอาเรื่องที่ไม่เกี่ยวกันมาต่อเป็นไอเดียใหม่ได้",
          "เบื่อวิธีเดิมๆ และอยากหาทางที่ดีกว่าอยู่เสมอ"] },
  };
  const STRENGTH_KEYS = Object.keys(STRENGTHS);

  // [leftStrength, statementIndex, rightStrength, statementIndex]
  // Generated once so every strength meets 4 different strengths and never repeats within 3 pairs.
  // Do NOT reorder: saved answers depend on this order.
  const PAIRS = [
    ["closer",0,"organizer",0],["dependable",0,"persuader",0],["connector",0,"captain",0],["listener",0,"teamglue",0],
    ["coach",0,"datareader",0],["organizer",1,"dependable",1],["persuader",1,"connector",1],["captain",1,"listener",1],
    ["teamglue",1,"coach",1],["datareader",1,"navigator",0],["creator",0,"closer",1],["organizer",2,"listener",2],
    ["dependable",2,"teamglue",2],["persuader",2,"coach",2],["navigator",1,"creator",1],["closer",2,"captain",2],
    ["connector",2,"datareader",2],["coach",3,"organizer",3],["listener",3,"creator",2],["captain",3,"navigator",2],
    ["teamglue",3,"closer",3],["datareader",3,"dependable",3],["creator",3,"connector",3],["navigator",3,"persuader",3],
  ];
  const STRENGTH_QUESTIONS = PAIRS.map(([lk, li, rk, ri]) => ({
    lk, rk, l: STRENGTHS[lk].s[li], r: STRENGTHS[rk].s[ri],
  }));

  // answer 1..4 -> points: 1 = left +2, 2 = left +1, 3 = right +1, 4 = right +2. Each strength 0..8.
  // Ranking (Gallup ranks CliftonStrengths by score on "intensity of self-description" and breaks ties
  // with secondary factors; we do the same in spirit, with what one answer sheet can tell us):
  //   1. points
  //   2. strong picks: how many times the person chose "มาก" (1 or 4) for this strength
  //   3. head-to-head: among strengths still tied, wins in the pairs where they met each other
  //   4. still tied: an order seeded from this person's own answers. Fair across people (no strength is
  //      favoured), and the same answers always give the same result. The page tells the person about the tie.
  function scoreStrengths(answers) {
    const pts = Object.fromEntries(STRENGTH_KEYS.map(k => [k, 0]));
    const strong = Object.fromEntries(STRENGTH_KEYS.map(k => [k, 0]));
    const beat = {}; // beat[a][b] = 1 when a won the pair against b
    STRENGTH_QUESTIONS.forEach((q, i) => {
      const v = answers[i];
      const [win, lose] = v <= 2 ? [q.lk, q.rk] : [q.rk, q.lk];
      pts[win] += v === 1 || v === 4 ? 2 : 1;
      if (v === 1 || v === 4) strong[win]++;
      (beat[win] = beat[win] || {})[lose] = 1;
    });
    let seed = answers.reduce((h, v, i) => (h * 31 + v * (i + 7)) >>> 0, 2166136261);
    const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
    const shuffled = [...STRENGTH_KEYS];
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    const key = k => pts[k] * 100 + strong[k];
    const h2h = Object.fromEntries(STRENGTH_KEYS.map(k => [k,
      STRENGTH_KEYS.filter(o => o !== k && key(o) === key(k) && beat[k] && beat[k][o]).length]));
    const ranked = [...STRENGTH_KEYS].sort((a, b) =>
      key(b) - key(a) || h2h[b] - h2h[a] || shuffled.indexOf(a) - shuffled.indexOf(b));
    return { strengthScores: pts, strengths: ranked.slice(0, 3) };
  }

  // ---------------- 4-letter type ----------------
  const AXES = {
    EI: { th: "แหล่งพลังงาน", letters: { E: "เติมพลังจากการเจอคน", I: "เติมพลังจากเวลาส่วนตัว" } },
    SN: { th: "การรับข้อมูล", letters: { S: "เชื่อข้อเท็จจริงตรงหน้า", N: "มองภาพรวมและความเป็นไปได้" } },
    TF: { th: "การตัดสินใจ", letters: { T: "ตัดสินด้วยเหตุผล", F: "ตัดสินด้วยคุณค่าและคน" } },
    JP: { th: "การจัดการงาน", letters: { J: "ชอบวางแผนและปิดงาน", P: "ชอบยืดหยุ่นและเปิดทางเลือก" } },
  };
  // lp = the letter of the LEFT statement
  const TYPE_QUESTIONS = [
    { ax: "EI", lp: "E", t: "หลังพบปะผู้คนมาทั้งวัน", l: "รู้สึกมีพลัง ยังอยากคุยต่อ", r: "อยากมีเวลาเงียบๆ คนเดียวเพื่อชาร์จพลัง" },
    { ax: "SN", lp: "S", t: "เวลาเรียนรู้สิ่งใหม่", l: "อยากเห็นตัวอย่างจริงและขั้นตอนชัดๆ", r: "อยากเข้าใจภาพรวมและหลักคิดก่อน" },
    { ax: "TF", lp: "T", t: "ต้องเลือกระหว่างสองทางเลือก", l: "เลือกทางที่สมเหตุสมผลที่สุด แม้บางคนจะไม่พอใจ", r: "เลือกทางที่ทุกคนรับได้ แม้จะไม่ได้ผลดีที่สุด" },
    { ax: "JP", lp: "J", t: "ก่อนเริ่มเรื่องใหญ่ เช่น ย้ายบ้านหรือไปเที่ยวต่างประเทศ", l: "วางแผนให้ชัดก่อนลงมือ", r: "เริ่มเลย แล้วปรับไประหว่างทาง" },
    { ax: "EI", lp: "I", t: "เวลาคิดเรื่องยาก", l: "คิดคนเดียวให้ตกผลึกก่อน แล้วค่อยเล่า", r: "คิดไปพูดไป ยิ่งได้คุยยิ่งคิดออก" },
    { ax: "SN", lp: "N", t: "เวลาเล่าเรื่อง", l: "เล่าเป็นภาพรวม ความหมาย และความเป็นไปได้", r: "เล่าตามลำดับ ละเอียด ตรงข้อเท็จจริง" },
    { ax: "TF", lp: "F", t: "ต้องบอกคนใกล้ตัวว่าเขาทำอะไรไม่ดี", l: "ระวังความรู้สึกเขาเป็นอันดับแรก", r: "พูดตรงๆ ว่าอะไรควรแก้ เพื่อให้ดีขึ้น" },
    { ax: "JP", lp: "P", t: "กับสิ่งที่มีกำหนดเวลา", l: "มักทำเสร็จช่วงท้ายๆ ตอนใกล้ถึงกำหนด", r: "ชอบทำเสร็จก่อนเวลา" },
    { ax: "EI", lp: "E", t: "กิจกรรมที่ชอบ", l: "ได้เจอและคุยกับคนเยอะๆ", r: "ได้โฟกัสลึกๆ คนเดียว ไม่มีใครรบกวน" },
    { ax: "SN", lp: "S", t: "ชอบทำสิ่งต่างๆ แบบไหน", l: "ใช้วิธีที่พิสูจน์แล้วว่าได้ผล", r: "คิดวิธีใหม่ที่ยังไม่มีใครทำ" },
    { ax: "TF", lp: "T", t: "ความยุติธรรมคือ", l: "ใช้กฎเดียวกันกับทุกคน", r: "ดูสถานการณ์และความจำเป็นของแต่ละคน" },
    { ax: "JP", lp: "J", t: "ห้องและข้าวของของคุณ", l: "เป็นระเบียบ รู้ว่าอะไรอยู่ตรงไหน", r: "ดูรกไปบ้าง แต่หาของเจอ" },
    { ax: "EI", lp: "I", t: "ในกลุ่มคนที่ไม่ค่อยรู้จัก", l: "ฟังและสังเกตก่อน", r: "เริ่มชวนคุยได้ไม่ยาก" },
    { ax: "SN", lp: "N", t: "เวลาฟังแผนหรือไอเดียของคนอื่น", l: "มองหาความเป็นไปได้และโอกาสใหม่ที่ซ่อนอยู่", r: "เช็กว่าทำได้จริงไหม ใช้เงินและเวลาเท่าไหร่" },
    { ax: "TF", lp: "F", t: "เวลาเพื่อนมาเล่าปัญหา", l: "รับฟังและให้กำลังใจก่อน", r: "ช่วยวิเคราะห์และหาทางแก้" },
    { ax: "JP", lp: "P", t: "เมื่อแผนถูกเปลี่ยนกะทันหัน", l: "ไม่เป็นไร ชอบความยืดหยุ่น", r: "หงุดหงิดนิดๆ อยากให้เป็นไปตามแผน" },
    { ax: "EI", lp: "E", t: "วันหยุดที่ดี", l: "นัดเพื่อน ไปที่ที่คนเยอะๆ", r: "อยู่บ้าน หรือทำอะไรกับคนสนิทไม่กี่คน" },
    { ax: "SN", lp: "S", t: "คนอื่นมักชมว่า", l: "ละเอียด จำรายละเอียดได้แม่น", r: "คิดไกล เห็นสิ่งที่คนอื่นยังไม่เห็น" },
    { ax: "TF", lp: "T", t: "ตัดสินใจเรื่องสำคัญ คุณให้น้ำหนักกับ", l: "ข้อมูลและผลลัพธ์", r: "คุณค่าและผลต่อคน" },
    { ax: "JP", lp: "J", t: "เรื่องที่ยังไม่ได้ตัดสินใจ", l: "อยากปิดให้จบเร็วๆ", r: "ชอบเปิดทางเลือกไว้ก่อน" },
  ];
  const PAIR_OF = { EI: ["E", "I"], SN: ["S", "N"], TF: ["T", "F"], JP: ["J", "P"] };

  // Each item: answer 1..4 -> 4..1 points to the left letter, 1..4 to the right. Per letter pair: 5 items,
  // so the first letter of the pair gets 5..20 points out of 25 total; > 12.5 wins (ties impossible).
  function scoreType(answers) {
    const pts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    TYPE_QUESTIONS.forEach((q, i) => {
      const [a, b] = PAIR_OF[q.ax], other = q.lp === a ? b : a;
      pts[q.lp] += 5 - answers[i];
      pts[other] += answers[i];
    });
    const type = Object.values(PAIR_OF).map(([a, b]) => (pts[a] > pts[b] ? a : b)).join("");
    // per axis: % toward the first letter (E, S, T, J)
    const typeScores = Object.fromEntries(Object.entries(PAIR_OF).map(([ax, [a, b]]) => [ax, Math.round(pts[a] / (pts[a] + pts[b]) * 100)]));
    return { type, typeScores };
  }

  const TYPES = {
    ISTJ: { th: "ผู้รักษามาตรฐาน", gist: "ละเอียด รับผิดชอบ ทำตามระบบอย่างสม่ำเสมอ", tip: "ให้ข้อมูลครบ เป็นลำดับ และบอกล่วงหน้าเมื่อจะเปลี่ยนแผน" },
    ISFJ: { th: "ผู้ดูแลเงียบๆ", gist: "ใส่ใจคน จำรายละเอียดของลูกค้าได้ดี ช่วยเหลือโดยไม่ต้องร้องขอ", tip: "ขอบคุณให้เห็น และถามความเห็นเขาตรงๆ เพราะอาจไม่พูดเอง" },
    INFJ: { th: "ผู้มองลึก", gist: "เข้าใจคนลึก มองเห็นความหมายเบื้องหลัง มีหลักการชัด", tip: "คุยเรื่องเป้าหมายและคุณค่าของงาน ให้เวลาคิดก่อนตอบ" },
    INTJ: { th: "นักวางแผนระยะยาว", gist: "คิดเป็นระบบ มองไกล ตั้งมาตรฐานสูง", tip: "คุยด้วยเหตุผลและภาพรวม อย่าลงรายละเอียดเล็กเกินไป" },
    ISTP: { th: "นักแก้ปัญหาหน้างาน", gist: "ใจเย็น แก้ปัญหาเฉพาะหน้าเก่ง ชอบลงมือจริง", tip: "ให้อิสระในวิธีทำ บอกแค่ผลลัพธ์ที่ต้องการ" },
    ISFP: { th: "ผู้ทำด้วยใจ", gist: "อ่อนโยน มีรสนิยม ใส่ใจประสบการณ์ของคนอื่น", tip: "ให้ feedback แบบเป็นส่วนตัวและนุ่มนวล ให้พื้นที่สร้างสรรค์" },
    INFP: { th: "ผู้ยึดคุณค่า", gist: "มีอุดมการณ์ สื่อสารด้วยเรื่องราวได้ดี ทำเต็มที่กับงานที่มีความหมาย", tip: "เชื่อมงานกับคุณค่าที่เขาใส่ใจ และหลีกเลี่ยงการวิจารณ์ต่อหน้าคนอื่น" },
    INTP: { th: "นักคิดเชิงระบบ", gist: "ชอบวิเคราะห์ หาเหตุผลเบื้องหลัง ตั้งคำถามเก่ง", tip: "เปิดให้ถกด้วยเหตุผล และช่วยกำหนดเส้นตายให้ชัด" },
    ESTP: { th: "นักลุยหน้างาน", gist: "กล้า ไว อ่านสถานการณ์เก่ง ชอบลงสนามจริง", tip: "คุยสั้น เน้น action และผลลัพธ์ที่เห็นได้เร็ว" },
    ESFP: { th: "ผู้สร้างสีสัน", gist: "มีพลัง เข้ากับคนง่าย ทำให้บรรยากาศสนุก", tip: "ให้ได้ทำงานกับคน และช่วยสรุปรายละเอียดเป็นลายลักษณ์อักษร" },
    ENFP: { th: "ผู้จุดไฟไอเดีย", gist: "กระตือรือร้น ไอเดียเยอะ ชวนคนอื่นให้อินตาม", tip: "รับฟังไอเดียก่อน แล้วช่วยเลือกเรื่องที่ทำจริงและตามให้จบ" },
    ENTP: { th: "นักท้าทายไอเดีย", gist: "คิดไว ชอบถกเถียง มองหาวิธีใหม่เสมอ", tip: "เปิดให้ท้าทายความคิดได้ และจับคู่กับคนที่ถนัดปิดงาน" },
    ESTJ: { th: "ผู้คุมงาน", gist: "ตรงไปตรงมา จัดการเป็น ทำให้งานเดินตามแผน", tip: "บอกเป้าหมาย ตัวเลข และกำหนดเวลาให้ชัด" },
    ESFJ: { th: "ผู้ประสานใจ", gist: "เอาใจใส่ ชอบช่วยเหลือ ทำให้ทุกคนรู้สึกเป็นทีม", tip: "แสดงความขอบคุณ และให้รู้ว่าการเปลี่ยนแปลงกระทบใครบ้าง" },
    ENFJ: { th: "ผู้นำที่ปลุกใจ", gist: "สื่อสารเก่ง เข้าใจคน ชอบพาทีมไปสู่เป้าหมายร่วมกัน", tip: "ให้มีส่วนในการพัฒนาคนและทีม และให้ feedback อย่างจริงใจ" },
    ENTJ: { th: "ผู้บัญชาการกลยุทธ์", gist: "มั่นใจ ตัดสินใจเด็ดขาด วางแผนและผลักดันเป้าใหญ่", tip: "มาพร้อมข้อมูลและข้อเสนอที่ชัด ไม่อ้อมค้อม" },
  };

  const api = {
    GROUPS, STRENGTHS, STRENGTH_KEYS, STRENGTH_QUESTIONS, scoreStrengths,
    AXES, PAIR_OF, TYPE_QUESTIONS, TYPES, scoreType,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Assessments = api;
})(this);
