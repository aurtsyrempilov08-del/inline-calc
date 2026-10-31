import * as vscode from 'vscode';

const mathScope = `
    const {
        abs, ceil, floor, round, trunc,
        max, min,
        sqrt, cbrt, pow,
        exp,
        sin, cos, tan, asin, acos, atan,
        PI, E
    } = Math;

    const pi = Math.PI;
    const e = Math.E;

    // Логарифмы
    const ln = (x) => Math.log(x);
    const lb = (x) => Math.log2(x);
    const lg = (x) => Math.log10(x);
    const log2 = Math.log2;
    const log10 = Math.log10;
    // log(x, base) — если основание не указано, считается натуральный логарифм
    const log = (x, base) => (base === undefined ? Math.log(x) : Math.log(x) / Math.log(base));

    // Корень произвольной степени n
    const root = (x, n) => Math.pow(x, 1 / n);

    // НОД и НОК
    const gcd = (a, b) => {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    };
    const lcm = (a, b) => (!a || !b ? 0 : Math.abs(a * b) / gcd(a, b));

    // Факториал n!
    const fact = (n) => {
        if (n < 0) return NaN;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    };

    // Сочетания C(n, k)
    const nCr = (n, k) => {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        k = Math.min(k, n - k);
        let c = 1;
        for (let i = 0; i < k; i++) {
            c = (c * (n - i)) / (i + 1);
        }
        return Math.round(c);
    };

    // Размещения P(n, k)
    const nPr = (n, k) => {
        if (k < 0 || k > n) return 0;
        let p = 1;
        for (let i = 0; i < k; i++) p *= (n - i);
        return p;
    };
`;

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('inline-calc.replaceWithResult', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        editor.edit(editBuilder => {
            for (const selection of editor.selections) {
                const expression = editor.document.getText(selection).trim();
                if (!expression) {
                    continue;
                }

                try {
                    const evaluate = new Function(`${mathScope} return (${expression});`);
                    const result = evaluate();

                    if (typeof result === 'number' && !Number.isNaN(result)) {
                        // Округляем погрешности чисел с плавающей точкой
                        const formatted = Number(result.toFixed(10)).toString();
                        editBuilder.replace(selection, formatted);
                    } else {
                        vscode.window.showWarningMessage(`Результат не число: "${expression}"`);
                    }
                } catch {
                    vscode.window.showErrorMessage(`Ошибка вычисления: "${expression}"`);
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}