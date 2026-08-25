import { ConstantCost, ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { parseBigNumber, BigNumber } from "./api/BigNumber";
import { Localization } from "./api/Localization";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";
import { Thickness } from "./api/ui/properties/Thickness";
import { Color } from "./api/ui/properties/Color";


//formula
var DMFormula = () => {
    let timeComponent = (t_r.value / BigNumber.from(110));
    let baseDM = timeComponent.pow(3);
    let multiplier = (BigNumber.ONE + darkIncre1.value) * (BigNumber.ONE + darkIncre2.value) * darkIncre3.value;
    return baseDM * multiplier;
}


//getValue
var getE = (amount) => {
    return amount * BigNumber.TEN.pow(25);
}

var getSchRadius = (M) => {
    return BigNumber.TWO * G.value * M / c.value.pow(2);
}

var getRadiusDiff = () => {
    return BigNumber.from(1.49) * BigNumber.TEN.pow(-43);
}

var getEpsilon = (M) => {
    return new Constant(getSchRadius(M) / getRadiusDiff(), Symbol.create("ε", "\\epsilon"));
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
    E1.reset();
    M.reset();
    EVal.reset();
    t.reset();
    t_r.reset();
    mi.reset();
    gamma.reset();
    darkIncre2.reset();
    darkIncre3.reset();
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
    constructor(calculate, symbol, latex) {
        this.calculate = calculate;
        this._symbol = symbol;
        this._latex = latex;
    }

    latex() {
        return this.symbol.latex + " = " + this._latex();
    }

    get symbol() {
        return this._symbol()
    }
}


var id = "revitalize_of_black_hole";
var name = "Revitalize of Black Hole";
var description = "A basic theory.";
var authors = "Tomster - Coder\nfien012 - Idea && Tester";
var version = 1;

//save_value
var minFormula = "None", lastBuyTime = 0;

//currency
var currency, darkMatter;

//upgrade
var E1, startTheory, mi, gamma, darkIncre2, darkIncre3,
    darkIncre1, lambda;

//permanent
var tDifla, unlockPsiIn, showRho;

//constant
const G = new Constant(BigNumber.from(6.674) * BigNumber.TEN.pow(-11), Symbol.create("G", "\\mathbb{G}")), 
    c = new Constant(BigNumber.from(2.99792458) * BigNumber.TEN.pow(8), Symbol.create("c", "\\mathit{c}")), 
    planck = new Constant(BigNumber.from(1.055) * BigNumber.TEN.pow(-34), Symbol.create("h", "\\hbar")), 
    K = new Constant(BigNumber.from(3.9628) * BigNumber.TEN.pow(15), Symbol.create("K", "\\mathcal{K}"));

//symbol
const EVal = new Stat(BigNumber.ZERO, Symbol.create("E", "\\mathbb{E}")), 
    t_r = new Stat(BigNumber.ZERO, Symbol.create("t", "t_r")), 
    t = new Stat(BigNumber.ZERO, Symbol.create("t", "t")), 
    M = new Stat(BigNumber.E * BigNumber.TEN.pow(10), Symbol.create("M", "\\mathcal{M}")), 
    Cn = new Stat(BigNumber.ZERO, Symbol.create("C_n", "C_n"));

//formula
const P1 = new Formula(
        () => BigNumber.from(12.642) * M.value.pow(2) * (EVal.value + BigNumber.ONE).log10() / M._default,
        () => Symbol.create("\\Phi_{\\text{a}}"),
        () => "\\frac{12.642 \\cdot " + M.symbol.latex + "^{2} \\cdot log_{10}\\left(1 + " + EVal.symbol.latex + "\\right)}{" + numberFormat(M._default, 2) + "}"
    ),
    P2 = new Formula(
        () => BigNumber.from(6.321) * M.value,
        () => Symbol.create("\\Phi_{\\text{e}}"),
        () => "6.321 \\cdot " + M.symbol.latex
    ),
    P3 = new Formula(
        () => K.value / (BigNumber.ONE + M.value.pow(2)),
        () => Symbol.create("\\Phi_{\\text{r}}"),
        () => "\\frac{" + K.symbol.latex + "}{" + M.symbol.latex + "^2 + 1}"
    ),
    Pabs = new Formula(
        () => P1.calculate().min(P2.calculate()),
        () => Symbol.create("\\Phi_{\\text{c}}"),
        () => "\\inf \\langle " + P1.symbol.latex + ", " + P2.symbol.latex + " \\rangle"
    ),
    dE = new Formula(
        (time) => {
            let val = [new Constant(EVal.value, EVal.symbol), 
                        new Constant(P3.calculate() / (BigNumber.ONE - gamma.value) * c.value.pow(2) * time, P3.symbol), 
                        new Constant(Pabs.calculate() * mi.value * time, Pabs.symbol)];
            let minVal = val[0].value;
            minFormula = val[0].symbol.latex;
            for (let i = 1; i < 3; i++) {
                if (val[i].value < minVal) {
                    minVal = val[i].value;
                    minFormula = val[i].symbol.latex;
                }
            }
            return -minVal;
        },
        () => Symbol.create("\\frac{d" + EVal.symbol.latex + "}{d" + t.symbol.latex + "}"),
        () => "-\\inf \\langle \\frac{" + P3.symbol.latex + c.symbol.latex + " ^{2}}{1 - " + gamma.symbol.latex + "}, " + Pabs.symbol.latex + mi.symbol.latex + " \\rangle"
    ),
    dM = new Formula(
        (time) => (BigNumber.ONE - gamma.value) * -dE.calculate(time) / c.value.pow(2) - time * P3.calculate(),
        () => Symbol.create("\\frac{d" + M.symbol.latex + "}{d" + t.symbol.latex + "}"),
        () => "-\\frac{d" + EVal.symbol.latex + "}{d" + t.symbol.latex + "} \\cdot \\frac{1 - " + gamma.symbol.latex + "}{" + c.symbol.latex + "^2} - " + P3.symbol.latex
    ),
    dt = new Formula(
        () => {
            let val = M._default;
            if (tDifla.upgrade.level > 0) val = M.value;
            return (BigNumber.ONE + getEpsilon(val).value).sqrt();
        },
        () => Symbol.create("d" + t.symbol.latex),
        () => {
            if (tDifla.upgrade.level > 0) return "\\sqrt{1 + " + getEpsilon(M.value).symbol.latex + "}";
            return dt.calculate();
        }
    ),
    rho = new Formula(
        (realTime) => realTime * (BigNumber.ONE + lambda.value * Cn.value) * M.value * BigNumber.TEN / M._default,
        () => Symbol.create("\\dot{" + currency.symbol + "}"),
        () => "\\frac{\\left(1 + " + lambda.symbol.latex + " \\cdot " + Cn.symbol.latex + " \\right) \\cdot " + M.symbol.latex + "}{" + numberFormat(M._default / BigNumber.TEN, 2) + "}"
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
        E1 = new Upgrade(
            theory.createSingularUpgrade(0, currency, new ConstantCost(BigNumber.TEN)), 
            Symbol.create(),
            (level) => (BigNumber.from(0.05) * level),
            (_) => Utils.getMath(EVal.symbol.latex + " \\uparrow " + getE(1)),
            (_) => Utils.getMath(EVal.symbol.latex + "\\text{ increase by }" + getE(1))
        );
        E1.upgrade.canBeRefunded = (_) => true;
        E1.upgrade.bought = (amount) => {
            let currentTime = t_r.value.toNumber();
            if (Math.abs(currentTime - lastBuyTime) >= 0.1) {
                EVal.value += amount * getE(1);
                lastBuyTime = currentTime;
            } else {
                E1.upgrade.refund(amount);
            }
        };
    }

    // mi
    {
        mi = new Upgrade(
            theory.createUpgrade(1, currency, new ExponentialCost(BigNumber.FIVE, BigNumber.from(1.18).log2())), 
            Symbol.create("µ", "\\mu"), 
            (level) => (BigNumber.FIVE + level * BigNumber.from(0.05))
        );
    }

    // gamma
    {
        gamma = new Upgrade(
            theory.createUpgrade(2, currency, new ExponentialCost(BigNumber.TEN.pow(2), BigNumber.TEN.pow(1).log2())), 
            Symbol.create("γ", "\\gamma"), 
            (level) => (BigNumber.from(0.9) - level * BigNumber.from(0.05)).max(BigNumber.from(0.1))
        );
        gamma.upgrade.maxLevel = 16;
    }

    // darkIncre2
    {
        darkIncre2 = new Upgrade(
            theory.createUpgrade(3, currency, new ExponentialCost(BigNumber.from(30000), BigNumber.from(1.15).log2())), 
            Symbol.create(),
            (level) => (BigNumber.from(0.05) * level),
            (_) => Utils.getMath(`+5 \\% \\operatorname{to} ${darkMatter.symbol}`),
            (_) => "The $" + darkMatter.symbol + "$ formula increased by $" + darkIncre2.value * BigNumber.HUNDRED  + "\\%$ to $" + darkIncre2._getValue(darkIncre2.upgrade.level + 1) * BigNumber.HUNDRED + "\\%$."
        );
        darkIncre2.upgrade.maxLevel = 20;
    }

    // darkIncre3
    {
        darkIncre3 = new Upgrade(
            theory.createUpgrade(4, currency, new ConstantCost(BigNumber.from(40000))), 
            Symbol.create(),
            (level) => (BigNumber.ONE + level * BigNumber.from(0.1) * (Cn.value + BigNumber.ONE).log()),
            (_) => `Enhances ${darkMatter.symbol} formula efficiency.`,
            (_) => `Scales ${darkMatter.symbol} gain relative to Collapses.`
        );
        darkIncre3.upgrade.maxLevel = 1;
    }

    /////////////////////
    // Permanent Upgrades

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));



    //darkMatter
    darkMatter = theory.createCurrency("Ψ", "\\Psi");
    let baseDarkID = 100;
    ///////////////////
    // Regular Upgrades

    //darkIncre1
    {
        darkIncre1 = new Upgrade(
            theory.createUpgrade(0 + baseDarkID, darkMatter, new LinearCost(BigNumber.ONE, BigNumber.ONE)), 
            Symbol.create(),
            (level) => (BigNumber.from(0.15) * level),
            (_) => Utils.getMath(`+15 \\% \\operatorname{to} ${darkMatter.symbol}`),
            (_) => "The $" + darkMatter.symbol + "$ formula increased by $" + darkIncre1.value * BigNumber.HUNDRED  + "\\%$ to $" + darkIncre1._getValue(darkIncre1.upgrade.level + 1) * BigNumber.HUNDRED + "\\%$."
        );
    }

    //lambda
    {
        lambda = new Upgrade(
            theory.createUpgrade(1 + baseDarkID, darkMatter, new LinearCost(BigNumber.TWO, BigNumber.TWO)), 
            Symbol.create("λ", "\\lambda"),
            (level) => (1 + level) * BigNumber.from(0.25)
        );
    }

    /////////////////////
    // Permanent Upgrades

    // show_rho_gain
    {
        showRho = new Upgrade(
            theory.createPermanentUpgrade(0 + baseDarkID, darkMatter, new ConstantCost(BigNumber.from(5))), 
            Symbol.create(), 
            (_) => BigNumber.ZERO,
            (_) => {
                if (showRho.upgrade.level < 1) return `Show ${Utils.getMath(currency.symbol)} gain rate.`;
                else return `Show minimum ${Utils.getMath(dE.symbol.latex)} formula`;
            },
            (_) => {
                if (showRho.upgrade.level < 1) return `Unlocks real-time tracking and calculation of your ${Utils.getMath(currency.symbol)} accumulation rate.`;
                else return `Unlocks the analytical formula for the minimum ${Utils.getMath(dE.symbol.latex)} boundary.`;
            }
        );
        showRho.upgrade.maxLevel = 2;
    }

    // unlock_upgrade
    {
        unlockPsiIn = new Upgrade(
            theory.createPermanentUpgrade(1 + baseDarkID, darkMatter, new ConstantCost(BigNumber.from(15))), 
            Symbol.create(), 
            (_) => BigNumber.ZERO,
            (_) => "Unlock More Upgrade.",
            (_) => `Unlocks new upgrades to boost ${Utils.getMath(darkMatter.symbol)} gain.`
        );
        unlockPsiIn.upgrade.maxLevel = 2;
    }

    // time_diflation
    {
        tDifla = new Upgrade(
            theory.createPermanentUpgrade(2 + baseDarkID, darkMatter, new ConstantCost(BigNumber.from(25))), 
            Symbol.create(), 
            (_) => BigNumber.ZERO,
            (_) => "Unlock Time Diflation.",
            (_) => `Unlock ${Utils.getMath(getEpsilon(0).symbol.latex)} .`
        );
        tDifla.upgrade.maxLevel = 1;
    }

    ///////////////////////
    //// Milestone Upgrades


    updateAvailability();
}

var updateAvailability = () => {
    darkIncre1.upgrade.isAvailable = Cn.value > 0;
    lambda.upgrade.isAvailable = Cn.value > 0;
    tDifla.upgrade.isAvailable = Cn.value > 10;
    unlockPsiIn.upgrade.isAvailable = Cn.value > 0;
    showRho.upgrade.isAvailable = Cn.value > 0;
    darkIncre2.upgrade.isAvailable = unlockPsiIn.upgrade.level > 0;
    darkIncre3.upgrade.isAvailable = unlockPsiIn.upgrade.level > 1;
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
    let realTime = BigNumber.from(elapsedTime * multiplier);
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
    theory.invalidatePrimaryEquation();
    theory.invalidateSecondaryEquation();
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
    let scale = 1;
    result += enter(rho.latex());

    result += enter(dE.latex());

    result += dM.latex();

    theory.primaryEquationScale = scale;
    theory.primaryEquationHeight = 110 * scale;
    return "\\begin{matrix}" + result + "\\end{matrix}";
}

var getQuaternaryEntries = () => {
    let quaternaryEntries = [];

    if (showRho.upgrade.level > 0) {
        quaternaryEntries.push(new QuaternaryEntry("\\dot{" + currency.symbol + "}", numberFormat(rho.calculate(1), 2)));
    }

    quaternaryEntries.push(new QuaternaryEntry(EVal.symbol.latex, numberFormat(EVal.value, 2)));
    quaternaryEntries.push(new QuaternaryEntry(M.symbol.latex, numberFormat(M.value, 2)));

    if (tDifla.upgrade.level > 0) {
        let Epsi = getEpsilon(M.value);
        quaternaryEntries.push(new QuaternaryEntry("r_s", numberFormat(getSchRadius(M.value), 2)));
        quaternaryEntries.push(new QuaternaryEntry(Epsi.symbol.latex, numberFormat(Epsi.value, 2)));
    }

    quaternaryEntries.push(new QuaternaryEntry(t_r.symbol.latex, numberFormat(t_r.value, 2)));
    return quaternaryEntries;
}

var getTertiaryEquation = () => {
    let result = "";
    let tEvap = M.value.pow(BigNumber.THREE) / (BigNumber.THREE * K.value);
    if (showRho.upgrade.level > 1) {
        result += enter(dE.symbol.latex + "\\text{ is }" + minFormula);
    }
    result += "T_{evap} = " + numberFormat(tEvap / dt.calculate(), 2);
    if (tDifla.upgrade.level > 0) result += ",\\text{ }r - r_s = " + numberFormat(getRadiusDiff(), 2);
    return "\\begin{matrix} " + result + " \\end{matrix}";
}

var getSecondaryEquation = () => {
    let result = "";
    let Epsi = getEpsilon(M.value);
    result += theory.latexSymbol + "=\\max\\rho";
    result += " ,\\text{ } " + dt.latex();
    if (tDifla.upgrade.level > 0) result += " ,\\text{ } " + Epsi.symbol.latex + " = \\frac{r_s}{r - r_s}";
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
                                    text: Utils.getMath(P3.latex()),
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
                                    text: Utils.getMath("\\begin{matrix} \\text{Reset your } " + currency.symbol + ", " + M.symbol.latex + ", " + EVal.symbol.latex + ", " + t.symbol.latex + ", " + t_r.symbol.latex + " \\\\ \\text{and all regular upgrades} \\end{matrix} \\\\"),
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
                                            popup.hide();
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
