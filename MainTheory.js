import { ConstantCost, ExponentialCost, FirstFreeCost, FreeCost, LinearCost } from "./api/Costs";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { Thickness } from "./api/ui/properties/Thickness";
import { Color } from "./api/ui/properties/Color";


//formula
var DMFormula = () => {
    return (t_r.value / BigNumber.from(90)).pow(3) * (BigNumber.ONE + darkIncre.value);
}


//getValue
var getE = (amount) => {
    return amount * BigNumber.TEN.pow(25);
}

var getSchRadius = () => {
    return BigNumber.TWO * G.value * M.value / c.value.pow(2);
}

var getRadiusDiff = () => {
    return BigNumber.from(1.49) * BigNumber.TEN.pow(-43);
}

var getEpsilon = () => {
    return new Constant(getSchRadius() / getRadiusDiff(), Symbol.create("ε", "\\epsilon"));
}


//support_function
var numberFormat = (value, decimals, negExpFlag=false) => {
    if (value >= BigNumber.ZERO)
    {
        if (value >= BigNumber.from(0.1) || value == BigNumber.ZERO) 
        {
            if (value > BigNumber.ZERO && value < BigNumber.ONE && decimals < 3)
            {
                return value.toString(3);
            }
            return value.toString(decimals);
        }
        else
        {
            let exp = Math.floor((value*BigNumber.from(1+1e-5)).log10().toNumber());
            let mts = (value * BigNumber.TEN.pow(-exp)).toString(decimals);
            if (exp > 0 || !negExpFlag)
            {
                return `${mts}e${exp}`;
            }
            else
            {
                return `${mts}e$\\,-$${-exp}`;
            }
        }
    }
    else
    {
        value = -value;
        if (value >= BigNumber.from(0.1) || value == BigNumber.ZERO) 
        {
            return (-value).toString(decimals);
        }
        else
        {
            let exp = Math.floor((value*BigNumber.from(1+1e-5)).log10().toNumber());
            let mts = (value * BigNumber.TEN.pow(-exp)).toString(decimals);
            return `-${mts}e${exp}`;
        }
    }
}

var enter = (latex) => latex + " \\\\\\\\ ";

var addEndIf = (string, bool, endString) => {
    if (bool) string += endString;
    return string;
}


//reset_layer
var collapseReset = () => {
    Cn.value+=BigNumber.ONE;
    darkMatter.value += DMFormula();
    currency.value = BigNumber.ZERO;
    startTheory.level = 0;
    M.reset();
    EVal.reset();
    t.reset();
    t_r.reset();
    mi.reset();
    gamma.reset();
    theory.clearGraph();
    theory.invalidatePrimaryEquation();
    theory.invalidateQuaternaryValues();
    theory.invalidateSecondaryEquation();
    theory.invalidateTertiaryEquation();
}


//class
class Symbol {
    constructor(normal, latex) {
        this.normal = normal;
        this.latex = latex;
    }

    static create(normal = null, latex = null) {
        if (normal == null) normal = "";
        if (latex == null) latex = normal;
        return new Symbol(normal, latex);
    }
}

class Stat {
    constructor(defaultValue, symbol) {
        this.value = BigNumber.from(defaultValue);
        this._default = BigNumber.from(defaultValue);
        this.symbol = symbol;
    }

    reset() {
        this.value = this._default;
    }
}

class Constant {
    constructor(defaultValue, symbol) {
        this.value = defaultValue;
        this.symbol = symbol;
    }
}

class Upgrade {
    constructor(upgrade, symbol, getValue, getDesc = null, getInfo = null) {
        this.upgrade = upgrade;
        this.symbol = symbol;
        this._getValue = getValue;
        if (getValue) {
            var subDesc = (level) => `${symbol.latex} = ${getValue(level).toString()}`;
            if (getDesc == null) getDesc = (level) => Utils.getMath(subDesc(level));
            if (getInfo == null) getInfo = (amount) => Utils.getMathTo(
                subDesc(this.upgrade.level), 
                subDesc(this.upgrade.level + amount)
            );
            this.upgrade.getDescription = (_) => getDesc(this.upgrade.level);
            this.upgrade.getInfo = (amount) => getInfo(amount);
        }
    }

    get value() {
        return BigNumber.from(this._getValue(this.upgrade.level));
    }

    reset() {
        this.upgrade.level = 0;
    }
}

class Formula {
    constructor(calculate, latex) {
        this.calculate = calculate;
        this.latex = latex;
    }
}


var id = "revitalize_of_black_hole";
var name = "Revitalize of Black Hole";
var description = "A basic theory.";
var authors = "Tomster - Coder\nfien012 - Idea && Tester";
var version = 1;

//currency
var currency, darkMatter;

//upgrade
var E1, startTheory, mi, gamma,
    darkIncre, lambda;

//permanent
var testMode, testRefund;
var tDifla;

//constant
const G = new Constant(BigNumber.from(6.674) * BigNumber.TEN.pow(-11), Symbol.create("G", "\\mathbb{G}")), 
    c = new Constant(BigNumber.from(2.99792458) * BigNumber.TEN.pow(8), Symbol.create("c", "\\mathit{c}")), 
    planck = new Constant(BigNumber.from(1.055) * BigNumber.TEN.pow(-34), Symbol.create("h", "\\hbar")), 
    K = new Constant(BigNumber.from(3.9628) * BigNumber.TEN.pow(15), Symbol.create("K", "\\mathcal{K}"));

//symbol
const EVal = new Stat(BigNumber.ZERO, Symbol.create("E", "\\mathbb{E}")), 
    t_r = new Stat(BigNumber.ZERO, Symbol.create("t", "t_r")), 
    t = new Stat(BigNumber.ZERO, Symbol.create("t", "t")), 
    M = new Stat(BigNumber.PI * BigNumber.TEN.pow(10), Symbol.create("M", "\\mathcal{M}")), 
    Cn = new Stat(BigNumber.ZERO, Symbol.create("C_n", "C_n"));

//formula
const P1 = new Formula(
        () => BigNumber.from(12.642) * M.value.pow(2) * (EVal.value + BigNumber.ONE).log10() / M._default,
        () => "P_1 = \\frac{12.642 \\cdot " + M.symbol.latex + "^{2} \\cdot log_{10}\\left(1 + " + EVal.symbol.latex + "\\right)}{" + numberFormat(M._default, 2) + "}"
    ),
    P2 = new Formula(
        () => BigNumber.from(6.321) * M.value,
        () => "P_2 = 6.321 \\cdot " + M.symbol.latex
    ),
    Pabs = new Formula(
        () => P1.calculate().min(P2.calculate()),
        () => "P_{\\text{abs}} = \\min\\left(P_1, P_2\\right)"
    ),
    dE = new Formula(
        (time) => -EVal.value.min((mi.value + BigNumber.TEN) * Pabs.calculate() * time),
        () => "\\frac{d" + EVal.symbol.latex + "}{d" + t.symbol.latex + "} = -\\min\\left(" + EVal.symbol.latex + ", " + mi.symbol.latex + " \\cdot P_{\\text{abs}}\\right)"
    ),
    dM = new Formula(
        (time) => (BigNumber.ONE - gamma.value) * -dE.calculate(time) / c.value.pow(2) - time * K.value / (BigNumber.ONE + M.value.pow(2)),
        () => "\\frac{d" + M.symbol.latex + "}{d" + t.symbol.latex + "} = -\\frac{d" + EVal.symbol.latex + "}{d" + t.symbol.latex + "} \\cdot \\frac{1 - " + gamma.symbol.latex + "}{" + c.symbol.latex + "^2} - \\frac{" + K.symbol.latex + "}{" + M.symbol.latex + "^2 + 1}"
    ),
    dt = new Formula(
        () => {
            if (tDifla.upgrade.isAvailable) return (BigNumber.ONE + getEpsilon().value).sqrt();
            return M._default * BigNumber.TEN.pow(3);
        },
        () => {
            let result = "d" + t.symbol.latex + " = ";
            if (tDifla.upgrade.isAvailable) result += "\\sqrt{1 + " + getEpsilon().symbol.latex + "}";
            result += dt.calculate();
            return result;
        }
    ),
    rho = new Formula(
        (realTime) => realTime * (BigNumber.ONE + lambda.value * Cn.value) * M.value * BigNumber.TEN / M._default,
        () => "\\dot{" + currency.symbol + "} = \\frac{\\left(1 + " + lambda.symbol.latex + " \\cdot " + Cn.symbol.latex + " \\right) \\cdot " + M.symbol.latex + "}{" + numberFormat(M._default / BigNumber.TEN, 2) + "}"
    );


//dynamicLabel
var dynamicLabel1;


var init = () => {
    currency = theory.createCurrency();
    ///////////////////
    // Regular Upgrades

    // startTheory
    {   
        startTheory = theory.createUpgrade(0, currency, new FreeCost());
        startTheory.getDescription = (_) => "Initialize Singularity";
        startTheory.getInfo = (_) => "Begin the black hole accretion cycle.";
        startTheory.maxLevel = 1;
    }

    // E1
    {
        E1 = theory.createSingularUpgrade(0, currency, new ConstantCost(BigNumber.TEN));
        E1.bought = (amount) => {
            EVal.value += amount * getE(1);
        };
        E1.getDescription = (_) => Utils.getMath(EVal.symbol.latex + " \\uparrow " + getE(1));
        E1.getInfo = (_) => Utils.getMath(EVal.symbol.latex + "\\text{ increase by }" + getE(1));
    }

    // mi
    {
        mi = new Upgrade(
            theory.createUpgrade(1, currency, new ExponentialCost(BigNumber.FIVE, BigNumber.from(1.18).log2())), 
            Symbol.create("µ", "\\mu"), 
            (level) => (BigNumber.FIVE + level * BigNumber.from(0.01))
        );
    }

    // gamma
    {
        gamma = new Upgrade(
            theory.createUpgrade(2, currency, new ExponentialCost(BigNumber.TEN.pow(2), BigNumber.TEN.pow(1).log2())), 
            Symbol.create("γ", "\\gamma"), 
            (level) => (BigNumber.from(0.9) - level / BigNumber.from(20)).max(BigNumber.from(0.1))
        );
        gamma.upgrade.maxLevel = 16;
    }

    /////////////////////
    // Permanent Upgrades
    {
        testMode = new Upgrade(
            theory.createPermanentUpgrade(0, currency, new FreeCost()), 
            Symbol.create("TimeScale"), 
            (level) => level + BigNumber.ONE
        );
        testMode.upgrade.maxLevel = 9;
    }
    {
        testRefund = new Upgrade(
            theory.createPermanentUpgrade(1, currency, new FreeCost()), 
            Symbol.create("Refund"), 
            (level) => BigNumber.ZERO
        );
        testRefund.upgrade.bought = (_) => {
            if (testMode.upgrade.level > 0) testMode.upgrade.level -= 1;
        }
    }

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));



    //darkMatter
    darkMatter = theory.createCurrency("Ψ", "\\Psi");
    ///////////////////
    // Regular Upgrades

    //darkIncre
    {
        darkIncre = new Upgrade(
            theory.createUpgrade(3, darkMatter, new LinearCost(BigNumber.ONE, BigNumber.ONE)), 
            Symbol.create(),
            (level) => BigNumber.from(0.15) * level,
            (_) => Utils.getMath(`+15 \\% \\operatorname{to} ${darkMatter.symbol}`),
            (_) => "The $" + darkMatter.symbol + "$ formula increased by $" + darkIncre.value * BigNumber.HUNDRED  + "\\%$ to $" + darkIncre._getValue(darkIncre.upgrade.level + 1) * BigNumber.HUNDRED + "\\%$."
        );
    }

    //lambda
    {
        lambda = new Upgrade(
            theory.createUpgrade(4, darkMatter, new LinearCost(BigNumber.TWO, BigNumber.TWO)), 
            Symbol.create("λ", "\\lambda"),
            (level) => BigNumber.ONE + level / BigNumber.FOUR
        );
    }

    /////////////////////
    // Permanent Upgrades
    let base = 100;
    {
        tDifla = new Upgrade(
            theory.createPermanentUpgrade(0 + base, darkMatter, new ConstantCost(BigNumber.from(25))), 
            Symbol.create(), 
            (_) => BigNumber.ZERO,
            (_) => "Buy this unlock this",
            (_) => "Open time diflation"
        );
        tDifla.upgrade.maxLevel = 1;
    }

    ///////////////////////
    //// Milestone Upgrades


    updateAvailability();
}

var updateAvailability = () => {
    darkIncre.upgrade.isAvailable = Cn.value > 0;
    lambda.upgrade.isAvailable = Cn.value > 0;
    tDifla.upgrade.isAvailable = Cn.value > 10;
}

var isCurrencyVisible = (index) => {
    switch (index) {
        case 0:
            return true;
        case 1:
            return Cn.value > 0;
        default:
            return false;
    }
}

var tick = (elapsedTime, multiplier) => {
    //calculate
    let realTime = BigNumber.from(elapsedTime * multiplier) * testMode.value;
    if (M.value == 0) {
        realTime = 0;
    }
    let time = realTime * dt.calculate();
    let bonus = theory.publicationMultiplier;

    if (startTheory.level > 0) {
        M.value += dM.calculate(time);
        M.value = M.value.max(BigNumber.ZERO);

        EVal.value += dE.calculate(time);

        t.value += time;
        t_r.value += realTime;

        currency.value += rho.calculate(realTime);
    }

    //dynamicLabel
    if (dynamicLabel1) {
        dynamicLabel1.text = Utils.getMath("\\begin{matrix} \\text{You now have } " + Cn.value + " \\text{ " + addEndIf("Collapse", Cn.value > 1, "s") + " } \\left(" + Cn.symbol.latex + " = " + Cn.value + "\\right) \\\\\\\\ \\text{You will earn }" + numberFormat(DMFormula(), 3) + darkMatter.symbol + " \\end{matrix} \\\\");
    }

    theory.invalidateQuaternaryValues();
    theory.invalidateTertiaryEquation();
    updateAvailability();
}

//Equation
var getInternalState = () => `${EVal.value} ${t.value} ${t_r.value} ${M.value} ${Cn.value}`

var setInternalState = (state) => {
    let values = state.split(" ");
    if (values.length > 0) EVal.value = parseBigNumber(values[0]);
    if (values.length > 1) t.value = parseBigNumber(values[1]);
    if (values.length > 2) t_r.value = parseBigNumber(values[2]);
    if (values.length > 3) M.value = parseBigNumber(values[3]);
    if (values.length > 4) Cn.value = parseBigNumber(values[4]);
}

var getPrimaryEquation = () => {
    let result = "";
    let scale = 1.1;
    let Epsi = getEpsilon();
    result += enter(rho.latex());

    result += enter(dt.latex());

    result += enter(dE.latex());

    result += dM.latex();

    theory.primaryEquationScale = scale;
    theory.primaryEquationHeight = 150 * scale;
    return "\\begin{matrix}" + result + "\\end{matrix}";
}

var getQuaternaryEntries = () => {
    let quaternaryEntries = [];
    let flagAll = quaternaryEntries.length == 0;
    let Epsi;
    let add = 0;
    if (flagAll) {
        quaternaryEntries.push(new QuaternaryEntry(EVal.symbol.latex, null));
        quaternaryEntries.push(new QuaternaryEntry(M.symbol.latex, null));
        quaternaryEntries.push(new QuaternaryEntry("r_s", null));
        if (tDifla.upgrade.isAvailable) {
            Epsi = getEpsilon();
            quaternaryEntries.push(new QuaternaryEntry(Epsi.symbol.latex, null));
            add++;
        }
        quaternaryEntries.push(new QuaternaryEntry(t.symbol.latex, null));
        quaternaryEntries.push(new QuaternaryEntry(t_r.symbol.latex, null));
    }
    quaternaryEntries[0].value = numberFormat(EVal.value, 2);
    quaternaryEntries[1].value = numberFormat(M.value, 2);
    quaternaryEntries[2].value = numberFormat(getSchRadius(), 2);
    if (tDifla.upgrade.isAvailable) {
        quaternaryEntries[3].value = numberFormat(Epsi.value, 2);
    }
    quaternaryEntries[3 + add].value = numberFormat(t.value, 2);
    quaternaryEntries[4 + add].value = numberFormat(t_r.value, 2);
    return quaternaryEntries;
}

var getTertiaryEquation = () => {
    let result = "";
    let tEvap = M.value.pow(BigNumber.THREE) / (BigNumber.THREE * K.value);
    result += "T_{evap} = " + numberFormat(tEvap / dt.calculate(), 2);
    if (tDifla.upgrade.isAvailable) result += ",\\text{ }r - r_s = " + numberFormat(getRadiusDiff(), 2);
    return result;
}

var getSecondaryEquation = () => {
    let result = "";
    let Epsi = getEpsilon();
    result += theory.latexSymbol + "=\\max\\rho";
    if (tDifla.upgrade.isAvailable) result += ",\\text{ }" + Epsi.symbol.latex + " = \\frac{r_s}{r - r_s}";
    return result;
}

var getEquationOverlay = () => {
    //question
    let button1 = ui.createButton({
        text: "?",
        fontSize: 30,
        textColor: Color.TEXT,
        backgroundColor: Color.TRANSPARENT,
        borderColor: Color.TRANSPARENT,
        widthRequest: 40,
        heightRequest: 40,
        horizontalOptions: LayoutOptions.START_AND_EXPAND,
        verticalOptions: LayoutOptions.END_AND_EXPAND,
        onPressed: () => {
            button1.textColor = Color.TEXT_DARK;
        },
        onReleased: () => {
            button1.textColor = Color.TEXT;
            let popup = ui.createPopup({
                        title: "Constant & Info",
                        content: ui.createStackLayout({
                            children: [
                                // --- 1. CÁC CÔNG THỨC P1, P2, P_abs ---
                                ui.createLatexLabel({
                                    text: Utils.getMath(P1.latex()),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath(P2.latex()),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath(Pabs.latex()),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),

                                // Dòng kẻ phân cách nhỏ cho đẹp mắt
                                ui.createBox({
                                    heightRequest: 1,
                                    backgroundColor: Color.TEXT,
                                    margin: new Thickness(0, 10)
                                }),

                                // --- 2. CÁC HẰNG SỐ VẬT LÝ ---
                                ui.createLatexLabel({
                                    text: Utils.getMath(G.symbol.latex + " = " + numberFormat(G.value, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath(c.symbol.latex + " = " + numberFormat(c.value, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath(planck.symbol.latex + " = " + numberFormat(planck.value, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                }),
                                ui.createLatexLabel({
                                    text: Utils.getMath(K.symbol.latex + " = " + numberFormat(K.value, 3)),
                                    horizontalTextAlignment: TextAlignment.CENTER
                                })
                            ]
                        })
                    });
            popup.show();
        },
    });

    //collapse
    let button2 = ui.createButton({
        text: "⚛",
        fontSize: 30,
        textColor: Color.TEXT,
        backgroundColor: Color.TRANSPARENT,
        borderColor: Color.TRANSPARENT,
        widthRequest: 40,
        heightRequest: 40,
        horizontalOptions: LayoutOptions.START_AND_EXPAND,
        verticalOptions: LayoutOptions.START_AND_EXPAND,
        onPressed: () => {
            button2.textColor = Color.TEXT_DARK;
        },
        onReleased: () => {
            let isReady = M.value.toNumber() == 0; 
        
            let colapText = isReady ? "Collapse!" : "You need to achieve a value of 0 for M.";
            let colapFontSize = isReady ? 20 : 15;

            button2.textColor = Color.TEXT;

            dynamicLabel1 = ui.createLatexLabel({
                horizontalTextAlignment: TextAlignment.CENTER,
                verticalTextAlignment: TextAlignment.CENTER
            });
            
            let popup = ui.createPopup({
                        title: "Collapse",
                        content: ui.createStackLayout({
                            children: [
                                ui.createLatexLabel({
                                    text: Utils.getMath("\\begin{matrix} \\text{Reset your } " + currency.symbol + ", " + M.symbol.latex + ", " + EVal.symbol.latex + ", " + t.symbol.latex + ", " + t_r.symbol.latex + " \\\\ \\text{and } " + mi.symbol.latex + ", " + gamma.symbol.latex + " \\text{ upgrades} \\end{matrix} \\\\"),
                                    horizontalTextAlignment: TextAlignment.CENTER,
                                    verticalTextAlignment: TextAlignment.CENTER
                                }),
                                dynamicLabel1,
                                ui.createButton({
                                    text: colapText,
                                    fontSize: colapFontSize,
                                    heightRequest: 35,
                                    onReleased: () => {
                                        if (isReady) {
                                            collapseReset();
                                            popup.hide(); // Tự động đóng popup sau khi reset thành công
                                        }
                                    }
                                })
                            ]
                        })
                    });
            popup.show();
        }
    });

    return ui.createStackLayout({
        children: [
            button2, button1
        ]
    });
};

var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value;
var get2DGraphValue = () => EVal.value.sign * (BigNumber.ONE + EVal.value).log10().toNumber();


init();
