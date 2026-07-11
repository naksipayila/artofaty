export type Project = {
  id: string
  title: string
  description: string
  cover: string
  coverCrop?: string
  images: string[]
  imageAspectRatios: string[]
  desktopCover?: string
}

type RobloxProjectSource = {
  id: string
  title: string
  cover: string
  video?: string
}

export type RobloxProject = RobloxProjectSource

export const artist = {
  name: 'Ali Taha Yapışkan',
  role: '3D Character Artist',
  location: 'Eskişehir, Turkey',
  email: 'qaliqtaha@gmail.com',
  artstation: 'https://www.artstation.com/artofaty',
  instagram: 'https://instagram.com/artofaty',
  linkedin: 'https://www.linkedin.com/in/artofaty',
  youtube: 'https://www.youtube.com/@artofaty'
}

export const projects: Project[] = [
  {
    id: 'anastasia',
    title: 'Anastasia',
    description: 'Personal practice work focused on hand-painted PBR, stylized anatomy, realtime presentation, and fantasy character detail.',
    cover: 'https://cdna.artstation.com/p/assets/covers/images/096/089/076/large/ali-taha-yapiskan-ali-taha-yapiskan-thumb3.webp?1770314065',
    desktopCover: 'https://cdna.artstation.com/p/assets/images/images/095/850/850/large/ali-taha-yapiskan-render1.webp?1770313842',
    coverCrop: '55% 32%',
    images: [
      'https://cdna.artstation.com/p/assets/images/images/095/850/850/large/ali-taha-yapiskan-render1.webp?1770313842',
      'https://cdnb.artstation.com/p/assets/images/images/095/850/865/large/ali-taha-yapiskan-render2.webp?1769686072',
      'https://cdna.artstation.com/p/assets/images/images/095/850/866/large/ali-taha-yapiskan-render3.webp?1769686078',
      'https://cdnb.artstation.com/p/assets/images/images/095/850/867/large/ali-taha-yapiskan-render4.webp?1769686085',
      'https://cdna.artstation.com/p/assets/images/images/095/850/870/large/ali-taha-yapiskan-render5.webp',
      'https://cdn.artstation.com/p/video_sources/003/074/080/turntable.mp4'
    ],
    imageAspectRatios: ['1 / 1', '1 / 1', '1 / 1', '1 / 1', '1 / 1', '1 / 1'],
  },
  {
    id: 'miss-fortune',
    title: 'Miss Fortune',
    description: 'A hand-painted texturing study made without generators, exploring readable forms, stylized material separation, and game-ready presentation.',
    cover: 'https://cdna.artstation.com/p/assets/images/images/088/540/482/large/ali-taha-yapiskan-missfortune.jpg?1748537997',
    coverCrop: '50% 35%',
    images: [
      'https://cdna.artstation.com/p/assets/images/images/088/540/482/large/ali-taha-yapiskan-missfortune.jpg?1748537997'
    ],
    imageAspectRatios: ['1 / 1'],
  },
  {
    id: 'mermaid',
    title: 'Mermaid',
    description: 'A practice character built around hand-painted texture decisions, silhouette clarity, and stylized fantasy presentation.',
    cover: 'https://cdnb.artstation.com/p/assets/images/images/088/540/785/large/ali-taha-yapiskan-mermaid-full.jpg?1766042317',
    coverCrop: 'center top',
    images: [
      'https://cdnb.artstation.com/p/assets/images/images/088/540/785/large/ali-taha-yapiskan-mermaid-full.jpg?1766042317'
    ],
    imageAspectRatios: ['1920 / 2824'],
  },
  {
    id: 'orc',
    title: 'Orc',
    description: 'A character bust created to practice new workflows, creature anatomy, sculpting discipline, grooming, and realistic rendering.',
    cover: 'https://cdna.artstation.com/p/assets/images/images/088/472/900/large/ali-taha-yapiskan-orc.jpg?1770710654',
    coverCrop: '48% 42%',
    images: [
      'https://cdna.artstation.com/p/assets/images/images/088/472/900/large/ali-taha-yapiskan-orc.jpg?1770710654'
    ],
    imageAspectRatios: ['1 / 1'],
  }
]

const defineRobloxProject = (project: RobloxProjectSource): RobloxProject => project

export const robloxProjects: RobloxProject[] = [
  defineRobloxProject({ id: 'mANbmy', title: 'Wendigo', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/058/883/large/naksi-naksi-videoframe-8835.webp?1777493577', video: 'https://cdn.artstation.com/p/video_sources/003/217/147/wendigo.mp4' }),
  defineRobloxProject({ id: 'K3ALqG', title: 'Krampus Shrek', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/059/805/large/naksi-naksi-videoframe-0.webp?1777485089', video: 'https://cdn.artstation.com/p/video_sources/003/217/198/krampus-shrek.mp4' }),
  defineRobloxProject({ id: 'EzraOq', title: 'Leshen', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/949/237/large/naksi-naksi-videoframe-872.webp?1778528120', video: 'https://cdn.artstation.com/p/video_sources/003/269/400/leshen.mp4' }),
  defineRobloxProject({ id: 'dydVeQ', title: 'Wise Mystical Tree', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/056/669/large/naksi-naksi-videoframe-443.webp?1777485120', video: 'https://cdn.artstation.com/p/video_sources/003/216/964/wise-mystical-tree.mp4' }),
  defineRobloxProject({ id: '3EKJbv', title: 'Mind Flayer', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/295/332/large/naksi-naksi-videoframe-8333.webp?1777484903', video: 'https://cdn.artstation.com/p/video_sources/003/231/020/octopus.mp4' }),
  defineRobloxProject({ id: 'kNgea0', title: 'Crawler', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/526/608/large/naksi-naksi-videoframe-9061.webp?1777485804', video: 'https://cdn.artstation.com/p/video_sources/003/245/213/crawler.mp4' }),
  defineRobloxProject({ id: '98qrkR', title: 'Ink Bendy', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/063/336/large/naksi-naksi-videoframe-660.webp?1777485161' }),
  defineRobloxProject({ id: '0lbwPy', title: 'Terrifier', cover: 'https://cdnb.artstation.com/p/assets/video_clips/images/098/073/123/large/naksi-thumb.jpg?1777484969' }),
  defineRobloxProject({ id: '4NDq5L', title: 'Scarecrow', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/081/269/large/naksi-naksi-videoframe-9582.webp?1778583259' }),
  defineRobloxProject({ id: 'L4Lm8k', title: 'The Rake', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/489/453/large/naksi-naksi-videoframe-635.webp?1778583434' }),
  defineRobloxProject({ id: '2BAJ8e', title: 'Ossis', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/828/190/large/naksi-naksi-videoframe-865.webp?1778164688' }),
  defineRobloxProject({ id: 'nJXOZ6', title: 'Bat', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/277/201/large/naksi-naksi-videoframe-9265.webp?1777494154' }),
  defineRobloxProject({ id: 'a0mZ4k', title: 'Cacodemon', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/595/981/large/naksi-naksi-videoframe-802.webp?1777493929' }),
  defineRobloxProject({ id: 'x39QgO', title: 'Sukuna Heian', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/094/217/large/naksi-naksi-videoframe-764.webp?1777485286' }),
  defineRobloxProject({ id: 'YGNzP3', title: 'Evil Santa', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/573/308/20260429125517/smaller_square/naksi-naksi-videoframe-760.jpg?1777485317' }),
  defineRobloxProject({ id: '5WAdeE', title: 'Worm', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/464/647/20260429152042/smaller_square/naksi-naksi-videoframe-949.jpg?1777494042' }),
  defineRobloxProject({ id: 'wre5r6', title: 'Girl Char', cover: 'https://cdnb.artstation.com/p/assets/video_clips/images/098/586/743/20260429152649/smaller_square/naksi-thumb.jpg?1777494409' }),
  defineRobloxProject({ id: '1NQkwK', title: 'Gatekeeper', cover: 'https://cdna.artstation.com/p/assets/video_clips/images/098/153/788/20260429152756/smaller_square/naksi-thumb.jpg?1777494476' }),
  defineRobloxProject({ id: 'ZlAEK8', title: 'SCP-3199', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/164/377/20260415161952/smaller_square/naksi-naksi-videoframe-1337.jpg?1776287992' }),
  defineRobloxProject({ id: '8B90Bq', title: 'Clown3', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/190/830/20260429125033/smaller_square/naksi-naksi-videoframe-9252.jpg?1777485033' }),
  defineRobloxProject({ id: 'BkGDwl', title: 'Ghost Face', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/545/425/20260428073048/smaller_square/naksi-naksi-videoframe-9374.jpg?1777379449' }),
  defineRobloxProject({ id: 'mAowAa', title: 'Scary', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/239/926/20260429152848/smaller_square/naksi-naksi-videoframe-695.jpg?1777494528' }),
  defineRobloxProject({ id: 'V2l0L5', title: 'Pinky', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/324/583/20260421030230/smaller_square/naksi-naksi-videoframe-8853.jpg?1776758550' }),
  defineRobloxProject({ id: 'XJ8Eaw', title: 'Dark Princess', cover: 'https://cdnb.artstation.com/p/assets/video_clips/images/098/488/803/20260426115127/smaller_square/naksi-thumb.jpg?1777222287' }),
  defineRobloxProject({ id: 'oJekyL', title: 'Grim Reaper', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/545/368/20260428072904/smaller_square/naksi-naksi-videoframe-603.jpg?1777379345' }),
  defineRobloxProject({ id: 'XJ80WD', title: 'Baby Ghost Face', cover: 'https://cdnb.artstation.com/p/assets/video_clips/images/098/591/393/20260429153012/smaller_square/naksi-thumb.jpg?1777494612' }),
  defineRobloxProject({ id: 'rl1dlG', title: 'Rydia', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/575/945/20260429041352/smaller_square/naksi-naksi-videoframe-9298.jpg?1777454032' }),
  defineRobloxProject({ id: 'RKoQLy', title: 'Harvester', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/583/151/20260429082835/smaller_square/naksi-naksi-videoframe-584.jpg?1777469315' }),
  defineRobloxProject({ id: 'QKqYWL', title: 'Ringmaster', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/585/633/20260429093752/smaller_square/naksi-naksi-videoframe-797.jpg?1777473472' }),
  defineRobloxProject({ id: 'DLe8m9', title: 'Creeper', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/056/267/20260427153524/smaller_square/naksi-naksi-videoframe-9252.jpg?1777322125' }),
  defineRobloxProject({ id: '2B0VNe', title: 'Pale Man Hand', cover: 'https://cdna.artstation.com/p/assets/video_clips/images/098/477/606/20260426021514/smaller_square/naksi-thumb.jpg?1777187714' }),
  defineRobloxProject({ id: 'wra0l5', title: 'Gun', cover: 'https://cdnb.artstation.com/p/assets/covers/images/098/084/397/20260413095317/smaller_square/naksi-naksi-videoframe-2685.jpg?1776091997' }),
  defineRobloxProject({ id: 'wrYlQ5', title: 'Pupkin', cover: 'https://cdnb.artstation.com/p/assets/video_clips/images/098/597/547/20260429161405/smaller_square/naksi-thumb.jpg?1777497245' }),
  defineRobloxProject({ id: 'kNxX30', title: 'Yarn Character', cover: 'https://cdna.artstation.com/p/assets/covers/images/098/609/942/20260430034813/smaller_square/naksi-naksi-videoframe-851.jpg?1777538893' }),
  defineRobloxProject({ id: 'bg4keG', title: 'Chain Clown', cover: 'https://cdna.artstation.com/p/assets/video_clips/images/098/651/364/20260501104150/smaller_square/naksi-thumb.jpg?1777650110' }),
  defineRobloxProject({ id: 'WX5EYJ', title: 'SCP-3008', cover: 'https://cdnb.artstation.com/p/assets/covers/images/099/158/865/20260529161251/smaller_square/naksi-naksi-videoframe-9244.jpg?1780089171' }),
  defineRobloxProject({ id: 'nJPkNr', title: 'Darling Dolly', cover: 'https://cdnb.artstation.com/p/assets/covers/images/099/491/919/20260529161213/smaller_square/naksi-naksi-videoframe-9368.jpg?1780089133' }),
  defineRobloxProject({ id: 'x36ke4', title: 'Leatherface', cover: 'https://cdnb.artstation.com/p/assets/video_clips/images/099/507/495/20260530093604/smaller_square/naksi-thumb.jpg?1780151765' }),
  defineRobloxProject({ id: '3En2ZD', title: 'Poor George', cover: 'https://cdna.artstation.com/p/assets/covers/images/099/536/930/20260531140655/smaller_square/naksi-naksi-videoframe-631.jpg?1780254415' }),
  defineRobloxProject({ id: 'YGy046', title: 'Bog Zombie', cover: 'https://cdnb.artstation.com/p/assets/covers/images/099/563/013/20260601103740/smaller_square/naksi-naksi-videoframe-514.jpg?1780328260' }),
  defineRobloxProject({ id: 'K3oD6X', title: 'Anxiety', cover: 'https://cdna.artstation.com/p/assets/covers/images/099/627/014/20260603110807/smaller_square/naksi-naksi-videoframe-9274.jpg?1780502887' }),
  defineRobloxProject({ id: 'nJPBP9', title: 'Jack the Reaper', cover: 'https://cdnb.artstation.com/p/assets/covers/images/091/534/889/smaller_square/naksi-naksi-5-jack-the-reaper-thumb.jpg?1757060162' }),
  defineRobloxProject({ id: '8Bd6XR', title: 'SCP-173', cover: 'https://cdna.artstation.com/p/assets/covers/images/091/539/216/smaller_square/naksi-naksi-16-scp-173-thumb.jpg?1757070204' }),
  defineRobloxProject({ id: 'a038mX', title: 'Crouchy', cover: 'https://cdnb.artstation.com/p/assets/covers/images/091/539/283/smaller_square/naksi-naksi-4-crouchy-thumb.jpg?1757070391' }),
  defineRobloxProject({ id: 'zxw4o4', title: 'Comedy Mask', cover: 'https://cdna.artstation.com/p/assets/covers/images/091/539/302/smaller_square/naksi-naksi-27-comedy-mask-thumb.jpg?1757070480' }),
  defineRobloxProject({ id: 'BkKPm6', title: 'Dragon', cover: 'https://cdnb.artstation.com/p/assets/covers/images/091/539/321/smaller_square/naksi-naksi-2-dragon-thumb.jpg?1757070558' }),
  defineRobloxProject({ id: 'K3Zdky', title: 'Sparkit', cover: 'https://cdnb.artstation.com/p/assets/covers/images/091/539/379/smaller_square/naksi-naksi-26-sparkit-thumb.jpg?1757070648' }),
  defineRobloxProject({ id: 'Nq3YQD', title: 'Kitsun', cover: 'https://cdnb.artstation.com/p/assets/covers/images/091/539/419/smaller_square/naksi-naksi-28-kitsun-thumb.jpg?1757070703' }),
  defineRobloxProject({ id: 'XJ89ly', title: 'Grintale', cover: 'https://cdna.artstation.com/p/assets/images/images/091/452/200/20250902133150/smaller_square/naksi-32-grintale.jpg?1756837910' }),
  defineRobloxProject({ id: 'oJYP5B', title: 'Lyleen', cover: 'https://cdna.artstation.com/p/assets/images/images/091/451/552/20250902131213/smaller_square/naksi-29-lyleen.jpg?1756836733' }),
  defineRobloxProject({ id: 'L4GbEK', title: 'Elizabee', cover: 'https://cdnb.artstation.com/p/assets/images/images/091/434/513/20250902033508/smaller_square/naksi-23-elizabee.jpg?1756802108' }),
  defineRobloxProject({ id: 'Nq3e4q', title: 'LittleFireGuy', cover: 'https://cdna.artstation.com/p/assets/images/images/091/434/592/20250902033427/smaller_square/naksi-24-littlefireguy.jpg?1756802067' }),
  defineRobloxProject({ id: 'AZGKdm', title: 'Penking', cover: 'https://cdna.artstation.com/p/assets/images/images/091/452/342/20250902133750/smaller_square/naksi-33-penking.jpg?1756838270' }),
  defineRobloxProject({ id: 'GvGDRz', title: 'Quivern', cover: 'https://cdna.artstation.com/p/assets/images/images/091/451/834/20250902131907/smaller_square/naksi-30-quivern.jpg?1756837147' }),
  defineRobloxProject({ id: 'YGdE1V', title: 'Fuack', cover: 'https://cdnb.artstation.com/p/assets/images/images/091/452/119/20250902132747/smaller_square/naksi-31-fuack.jpg?1756837667' }),
  defineRobloxProject({ id: 'AZG42N', title: 'Relaxaurus', cover: 'https://cdnb.artstation.com/p/assets/images/images/091/434/723/20250902033441/smaller_square/naksi-25-relaxaurus.jpg?1756802081' }),
  defineRobloxProject({ id: 'dyD6Qw', title: 'Chikipi', cover: 'https://cdnb.artstation.com/p/assets/images/images/091/433/803/20250902023806/smaller_square/naksi-22-chikipi.jpg?1756798687' })
]
