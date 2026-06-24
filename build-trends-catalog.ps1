$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pptxPath = Join-Path $root 'LavDragon_Trendy_2026.pptx'
$pdfPath = Join-Path $root 'LavDragon_Trendy_2026.pdf'

$ppLayoutBlank = 12
$ppSaveAsOpenXMLPresentation = 24
$ppSaveAsPDF = 32
$msoFalse = 0
$msoTrue = -1
$msoTextOrientationHorizontal = 1
$msoShapeRectangle = 1
$msoShapeRoundedRectangle = 5

$slideW = 595.28
$slideH = 841.89
$margin = 48
$footerY = 807

function Rgb([int]$r, [int]$g, [int]$b) {
    return $r + ($g * 256) + ($b * 65536)
}

$colors = @{
    Black = Rgb 8 9 13
    Ivory = Rgb 244 245 247
    Graphite = Rgb 45 45 45
    Muted = Rgb 102 106 115
    Lavender = Rgb 185 167 216
    Silver = Rgb 201 206 214
    White = Rgb 255 255 255
}

function Add-Text {
    param(
        $Slide,
        [string]$Text,
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [double]$Size = 14,
        [string]$Font = 'Arial',
        [int]$Color = $colors.Black,
        [bool]$Bold = $false,
        [int]$Align = 1
    )
    $shape = $Slide.Shapes.AddTextbox($msoTextOrientationHorizontal, $X, $Y, $W, $H)
    $shape.TextFrame2.TextRange.Text = $Text
    $shape.TextFrame2.TextRange.Font.Name = $Font
    $shape.TextFrame2.TextRange.Font.Size = $Size
    $shape.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = $Color
    $shape.TextFrame2.TextRange.Font.Bold = $(if ($Bold) { $msoTrue } else { $msoFalse })
    $shape.TextFrame2.TextRange.ParagraphFormat.Alignment = $Align
    $shape.TextFrame2.MarginLeft = 0
    $shape.TextFrame2.MarginRight = 0
    $shape.TextFrame2.MarginTop = 0
    $shape.TextFrame2.MarginBottom = 0
    $shape.TextFrame2.WordWrap = $msoTrue
    return $shape
}

function Add-ImageFrame {
    param(
        $Slide,
        [string]$Path,
        [double]$X,
        [double]$Y,
        [double]$W,
        [double]$H,
        [string]$Mode = 'Contain',
        [int]$FrameColor = $colors.White
    )
    $frame = $Slide.Shapes.AddShape($msoShapeRoundedRectangle, $X, $Y, $W, $H)
    $frame.Line.Visible = $msoFalse
    $frame.Fill.ForeColor.RGB = $FrameColor

    $picture = $Slide.Shapes.AddPicture($Path, $msoFalse, $msoTrue, 0, 0, -1, -1)
    $picture.LockAspectRatio = $msoTrue
    $scaleX = $W / $picture.Width
    $scaleY = $H / $picture.Height
    if ($Mode -eq 'Cover') {
        if ($scaleX -ge $scaleY) { $picture.Width = $W } else { $picture.Height = $H }
    } else {
        if ($scaleX -le $scaleY) { $picture.Width = $W } else { $picture.Height = $H }
    }
    $picture.Left = $X + (($W - $picture.Width) / 2)
    $picture.Top = $Y + (($H - $picture.Height) / 2)
    return $picture
}

function Add-Footer {
    param($Slide, [int]$Number, [bool]$Light = $false)
    $color = if ($Light) { Rgb 210 212 218 } else { $colors.Muted }
    $line = $Slide.Shapes.AddShape($msoShapeRectangle, $margin, $footerY, $slideW - (2 * $margin), 0.8)
    $line.Line.Visible = $msoFalse
    $line.Fill.ForeColor.RGB = $color
    $line.Fill.Transparency = 0.45
    Add-Text $Slide 'LavDragon • Фотозоны и оформление мероприятий в Минске' $margin ($footerY + 8) 410 15 8.5 'Arial' $color $false | Out-Null
    Add-Text $Slide ('{0:D2}' -f $Number) ($slideW - $margin - 25) ($footerY + 8) 25 15 8.5 'Arial' $color $true 3 | Out-Null
}

function Add-Eyebrow {
    param($Slide, [string]$Text, [bool]$Light = $false)
    $color = if ($Light) { Rgb 205 192 226 } else { Rgb 113 97 143 }
    Add-Text $Slide $Text.ToUpper() $margin 50 490 18 9 'Arial' $color $true | Out-Null
}

function Add-Title {
    param($Slide, [string]$Text, [bool]$Light = $false, [double]$Size = 29)
    $color = if ($Light) { $colors.Ivory } else { $colors.Black }
    Add-Text $Slide $Text $margin 77 500 70 $Size 'Georgia' $color $true | Out-Null
}

function Add-AccentLine {
    param($Slide, [double]$Y = 149)
    $line = $Slide.Shapes.AddShape($msoShapeRoundedRectangle, $margin, $Y, 58, 4)
    $line.Line.Visible = $msoFalse
    $line.Fill.ForeColor.RGB = $colors.Lavender
}

function Add-BodyCopy {
    param($Slide, [string]$Text, [double]$Y, [bool]$Light = $false, [double]$W = 499)
    $color = if ($Light) { Rgb 205 208 214 } else { Rgb 68 73 82 }
    Add-Text $Slide $Text $margin $Y $W 75 13.5 'Arial' $color $false | Out-Null
}

function Add-TwoImagesPage {
    param(
        $Presentation,
        [int]$Number,
        [string]$Eyebrow,
        [string]$Title,
        [string]$Image1,
        [string]$Image2,
        [string]$Copy,
        [bool]$Dark = $false,
        [string]$Layout = 'PortraitPair'
    )
    $slide = $Presentation.Slides.Add($Presentation.Slides.Count + 1, $ppLayoutBlank)
    $bg = if ($Dark) { $colors.Black } else { $colors.Ivory }
    $background = $slide.Shapes.AddShape($msoShapeRectangle, 0, 0, $slideW, $slideH)
    $background.Line.Visible = $msoFalse
    $background.Fill.ForeColor.RGB = $bg
    Add-Eyebrow $slide $Eyebrow $Dark
    Add-Title $slide $Title $Dark
    Add-AccentLine $slide
    $frameColor = if ($Dark) { Rgb 25 27 33 } else { $colors.White }
    if ($Layout -eq 'Stacked') {
        Add-ImageFrame $slide $Image1 48 172 499 232 'Contain' $frameColor | Out-Null
        Add-ImageFrame $slide $Image2 48 420 499 232 'Contain' $frameColor | Out-Null
        Add-BodyCopy $slide $Copy 674 $Dark
    } elseif ($Layout -eq 'Mixed') {
        Add-ImageFrame $slide $Image1 48 176 205 430 'Contain' $frameColor | Out-Null
        Add-ImageFrame $slide $Image2 270 250 277 282 'Contain' $frameColor | Out-Null
        Add-BodyCopy $slide $Copy 634 $Dark
    } else {
        Add-ImageFrame $slide $Image1 48 176 250 430 'Contain' $frameColor | Out-Null
        Add-ImageFrame $slide $Image2 315 176 232 430 'Contain' $frameColor | Out-Null
        Add-BodyCopy $slide $Copy 634 $Dark
    }
    Add-Footer $slide $Number $Dark
}

$images = @{
    Bloom = Join-Path $root 'picture\wedding\svadebnaya-fotozona-minsk-bloom.webp'
    Flowers = Join-Path $root 'picture\wedding\svadebnaya-fotozona-minsk-cvety.webp'
    BirthdayScene = Join-Path $root 'picture\birthday\fotozona-den-rozhdeniya-minsk-scena.webp'
    HappyBirthday = Join-Path $root 'picture\birthday\fotozona-den-rozhdeniya-minsk-happy-birthday.webp'
    KidsOne = Join-Path $root 'picture\children-parties\detskaya-fotozona-minsk-odin-god.webp'
    KidsPink = Join-Path $root 'picture\children-parties\detskaya-fotozona-minsk-pink.webp'
    RoseService = Join-Path $root 'picture\hall-decoration\decoration-minsk-service-rose.webp'
    Dry = Join-Path $root 'picture\hall-decoration\decoration-minsk-suhoy.webp'
    Number20 = Join-Path $root 'picture\numbers\arenda-cifr-20-let-minsk.webp'
    BirthdayDecor = Join-Path $root 'picture\birthday\fotozona-den-rozhdeniya-minsk-dekor.webp'
    Menu = Join-Path $root 'picture\hall-decoration\decoration-minsk-menu.webp'
}

foreach ($image in $images.Values) {
    if (-not (Test-Path -LiteralPath $image)) {
        throw "Не найдено изображение: $image"
    }
}

$powerPoint = New-Object -ComObject PowerPoint.Application
$powerPoint.Visible = $msoTrue
$presentation = $powerPoint.Presentations.Add()
$presentation.PageSetup.SlideWidth = $slideW
$presentation.PageSetup.SlideHeight = $slideH

try {
    # Page 1 — Cover
    $slide = $presentation.Slides.Add(1, $ppLayoutBlank)
    Add-ImageFrame $slide $images.Bloom 0 0 $slideW $slideH 'Cover' $colors.Black | Out-Null
    $overlay = $slide.Shapes.AddShape($msoShapeRectangle, 0, 0, $slideW, $slideH)
    $overlay.Line.Visible = $msoFalse
    $overlay.Fill.ForeColor.RGB = $colors.Black
    $overlay.Fill.Transparency = 0.37
    Add-Text $slide 'LAVDRAGON' 48 45 220 20 12 'Georgia' $colors.White $true | Out-Null
    $tag = $slide.Shapes.AddShape($msoShapeRoundedRectangle, 48, 515, 160, 28)
    $tag.Line.ForeColor.RGB = $colors.White
    $tag.Line.Transparency = 0.4
    $tag.Fill.Transparency = 1
    Add-Text $slide 'КАТАЛОГ ИДЕЙ • 2026' 59 523 140 12 8.5 'Arial' $colors.White $true | Out-Null
    Add-Text $slide 'Тренды фотозон 2026' 48 560 500 100 43 'Georgia' $colors.White $true | Out-Null
    Add-Text $slide 'Самые востребованные идеи оформления свадеб, юбилеев и детских праздников в 2026 году' 48 676 455 68 16 'Arial' (Rgb 232 233 236) $false | Out-Null
    Add-Footer $slide 1 $true

    # Pages 2–4
    Add-TwoImagesPage $presentation 2 'Свадебный тренд №1' 'Натуральные цветочные композиции' $images.Bloom $images.Flowers 'В 2026 году клиенты всё чаще выбирают воздушные композиции из живых и декоративных цветов в кремовых, бежевых и пудровых оттенках.'
    Add-TwoImagesPage $presentation 3 'Праздничное оформление' 'Юбилеи и дни рождения' $images.BirthdayScene $images.HappyBirthday 'Основной тренд — сочетание крупных декоративных элементов, персонализированных надписей и современной геометрии.' $true 'Stacked'
    Add-TwoImagesPage $presentation 4 'Pinterest-эстетика' 'Детские фотозоны' $images.KidsOne $images.KidsPink 'Популярность продолжают набирать Pinterest-фотозоны в мягких оттенках и с минималистичным оформлением.' $false 'Stacked'

    # Page 5 — Colors
    $slide = $presentation.Slides.Add(5, $ppLayoutBlank)
    $slide.Background.Fill.ForeColor.RGB = $colors.Ivory
    Add-Eyebrow $slide 'Палитра сезона'
    Add-Title $slide 'Трендовые цвета 2026'
    Add-ImageFrame $slide $images.RoseService 48 160 499 220 'Contain' $colors.White | Out-Null
    Add-Text $slide 'Пудрово-розовый' 48 390 245 28 17 'Georgia' $colors.Black $true | Out-Null
    Add-ImageFrame $slide $images.Dry 48 438 499 220 'Contain' $colors.White | Out-Null
    Add-Text $slide 'Бежево-песочный' 48 668 245 28 17 'Georgia' $colors.Black $true | Out-Null
    Add-BodyCopy $slide 'Эти оттенки выглядят дорого на фотографиях и подходят практически для любого формата мероприятия.' 714
    Add-Footer $slide 5

    # Page 6 — Neon
    Add-TwoImagesPage $presentation 6 'Вечерние мероприятия' 'Подсветка и неон' $images.Number20 $images.BirthdayDecor 'Неоновые надписи, светящиеся цифры и контурная подсветка остаются одним из самых востребованных решений для вечерних мероприятий.' $true 'Mixed'

    # Page 7 — Personalization
    $slide = $presentation.Slides.Add(7, $ppLayoutBlank)
    $slide.Background.Fill.ForeColor.RGB = $colors.Ivory
    Add-Eyebrow $slide 'Детали со смыслом'
    Add-Title $slide 'Персонализация'
    Add-ImageFrame $slide $images.Menu 48 170 499 374 'Contain' $colors.White | Out-Null
    $card = $slide.Shapes.AddShape($msoShapeRoundedRectangle, 48, 570, 499, 145)
    $card.Line.ForeColor.RGB = Rgb 220 222 227
    $card.Fill.ForeColor.RGB = $colors.White
    Add-Text $slide 'История вашего события — в каждой детали' 70 592 455 34 18 'Georgia' $colors.Black $true | Out-Null
    Add-Text $slide 'Индивидуальные надписи, имена, даты, монограммы и фирменные элементы помогают сделать оформление уникальным.' 70 642 455 54 11.5 'Arial' $colors.Muted $false | Out-Null
    Add-Footer $slide 7

    # Page 8 — Advice
    $slide = $presentation.Slides.Add(8, $ppLayoutBlank)
    $slide.Background.Fill.ForeColor.RGB = $colors.Ivory
    Add-Eyebrow $slide 'Короткий гид'
    Add-Title $slide 'Как выбрать фотозону для своего праздника'
    Add-Text $slide 'Начните с формата события, пространства площадки и настроения, которое хочется сохранить на фотографиях.' 48 160 490 55 13 'Arial' $colors.Muted $false | Out-Null
    $cards = @(
        @{ X = 48; Y = 245; N = '01'; Title = 'Свадьба'; Copy = 'Светлые оттенки, цветы, ткань.' },
        @{ X = 305; Y = 245; N = '02'; Title = 'Юбилей'; Copy = 'Подсветка, цифры, акцентные элементы.' },
        @{ X = 48; Y = 480; N = '03'; Title = 'Детский праздник'; Copy = 'Мягкие формы и пастельные цвета.' },
        @{ X = 305; Y = 480; N = '04'; Title = 'Корпоратив'; Copy = 'Логотип компании и брендирование.' }
    )
    foreach ($item in $cards) {
        $card = $slide.Shapes.AddShape($msoShapeRoundedRectangle, $item.X, $item.Y, 242, 190)
        $card.Line.ForeColor.RGB = Rgb 224 225 229
        $card.Fill.ForeColor.RGB = $colors.White
        $circle = $slide.Shapes.AddShape(9, $item.X + 22, $item.Y + 22, 38, 38)
        $circle.Line.Visible = $msoFalse
        $circle.Fill.ForeColor.RGB = Rgb 217 209 232
        Add-Text $slide $item.N ($item.X + 22) ($item.Y + 33) 38 15 9 'Arial' $colors.Black $true 2 | Out-Null
        Add-Text $slide $item.Title ($item.X + 22) ($item.Y + 83) 195 32 19 'Georgia' $colors.Black $true | Out-Null
        Add-Text $slide $item.Copy ($item.X + 22) ($item.Y + 127) 195 43 11.5 'Arial' $colors.Muted $false | Out-Null
    }
    Add-Footer $slide 8

    # Page 9 — CTA
    $slide = $presentation.Slides.Add(9, $ppLayoutBlank)
    $background = $slide.Shapes.AddShape($msoShapeRectangle, 0, 0, $slideW, $slideH)
    $background.Line.Visible = $msoFalse
    $background.Fill.ForeColor.RGB = $colors.Black
    $glow = $slide.Shapes.AddShape(9, 390, -80, 250, 250)
    $glow.Line.Visible = $msoFalse
    $glow.Fill.ForeColor.RGB = $colors.Lavender
    $glow.Fill.Transparency = 0.45
    Add-Eyebrow $slide 'LavDragon • Минск' $true
    Add-Text $slide 'Получите бесплатный расчёт фотозоны' 68 210 460 110 38 'Georgia' $colors.White $true | Out-Null
    Add-Text $slide 'Мы подберём оформление под вашу площадку, стиль мероприятия и бюджет.' 68 345 430 60 15 'Arial' (Rgb 211 213 218) $false | Out-Null
    $benefitCard = $slide.Shapes.AddShape($msoShapeRoundedRectangle, 68, 440, 460, 170)
    $benefitCard.Line.ForeColor.RGB = Rgb 90 90 98
    $benefitCard.Fill.ForeColor.RGB = Rgb 27 29 35
    $benefits = "✓ Более 100 реализованных проектов`n✓ Монтаж и демонтаж включены`n✓ Работаем по Минску и области`n✓ Индивидуальный дизайн"
    Add-Text $slide $benefits 92 467 410 120 13 'Arial' $colors.White $true | Out-Null
    $telegram = $slide.Shapes.AddShape($msoShapeRoundedRectangle, 68, 652, 205, 48)
    $telegram.Line.Visible = $msoFalse
    $telegram.Fill.ForeColor.RGB = $colors.Silver
    Add-Text $slide 'Telegram' 68 667 205 17 12 'Arial' $colors.Black $true 2 | Out-Null
    $telegram.ActionSettings(1).Hyperlink.Address = 'https://t.me/kidseventa1'
    $phone = $slide.Shapes.AddShape($msoShapeRoundedRectangle, 290, 652, 205, 48)
    $phone.Line.ForeColor.RGB = $colors.White
    $phone.Fill.Transparency = 1
    Add-Text $slide 'Телефон' 290 667 205 17 12 'Arial' $colors.White $true 2 | Out-Null
    $phone.ActionSettings(1).Hyperlink.Address = 'tel:+375291357999'
    Add-Footer $slide 9 $true

    if (Test-Path -LiteralPath $pptxPath) { Remove-Item -LiteralPath $pptxPath -Force }
    if (Test-Path -LiteralPath $pdfPath) { Remove-Item -LiteralPath $pdfPath -Force }
    $presentation.SaveAs($pptxPath, $ppSaveAsOpenXMLPresentation)
    $presentation.SaveAs($pdfPath, $ppSaveAsPDF)
}
finally {
    $presentation.Close()
    $powerPoint.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Write-Output "Created: $pdfPath"






