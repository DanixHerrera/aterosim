# AteroSim — Decisiones de Diseño

## 1. Desgaste por Segmento

- Cada `Segmento` tiene un atributo `desgaste` de `0.0` a `1.0`.
- `"dañado"` se activa cuando `desgaste` supera un umbral (ej. `>= 0.3`).
- El estado binario `isDamage()` existente se deriva del valor de `desgaste`.
- El desgaste aumenta **dinámicamente** durante la simulación por contacto con oxidantes/LDL oxidados.
- **Condición inicial**: combinación de seed predefinido (algunos segmentos arrancan con desgaste inicial) + dinámica posterior.
- Aplica de forma **independiente** a la pared superior y a la pared inferior (cada una tiene su propio `Endotelio` con sus propios segmentos).

### Propagación a vecinos
- Cuando el desgaste de un segmento cambia, los vecinos se actualizan **inmediatamente cada frame**.
- Radio de propagación: **2–3 segmentos** a cada lado.
- Fórmula de decaimiento: `desgasteVecino = desgasteFuente * 0.6 / distancia`.
- El daño del vecino **nunca supera** al del segmento fuente.

---

## 2. Acumulación de Placa y Sub-segmento Amarillo

Cada `Segmento` tiene un sub-segmento interno de placa:
- Atributo `placaAltura` (número, inicia en `0`).
- Se renderiza como una franja **amarilla** entre la pared y el endotelio.
- **Sin techo**: puede crecer hasta cerrar el lumen completamente.
- El borde superior del segmento (cara al lumen) se desplaza según `placaAltura`, reduciendo el canal.

---

## 3. Curvas de las Paredes — Perlin Noise 1D

- Ambas capas (`Intima` y `Endotelio`) se ondulan, con distinto nivel de amplitud, **siguiendo la misma onda**.
- Las curvas son **estáticas** (se generan al inicializar la `Arteria`, no cambian).
- Las paredes **superior e inferior son simétricas en la curva** (espejo una de la otra → canal de ancho constante).
- Parámetros (`amplitud`, `frecuencia/escala`, `seed`) son **atributos de `Arteria`**, modificables por código, no por el usuario en runtime.

### Curvatura aditiva del segmento
El borde superior de cada `Segmento` = **Perlin Noise base** + **desplazamiento por `placaAltura`**.
- Ambos se suman para definir la posición real del borde.
- El segmento se renderiza como `quad()` o `beginShape()` con vértices interpolados entre vecinos para lograr la curva suave.

### Colisión y límites
- Los agentes respetan la **forma real de la curva** (límites del lumen por segmento, no rectángulo fijo).
- `dentroDelLumen()` en `Arteria` se actualiza para considerar la curvatura.

---

## 4. Flujo de Aterogénesis (interacciones agente↔segmento)

```
LDL normal
  → [contacto con Oxidante]
  → LDL oxidado

LDL oxidado
  → [se acerca a la pared y detecta segmento con desgaste >= 0.6]
  → seek hacia ese segmento (atracción)
  → cruza físicamente el segmento (cambia pos.y al espacio de la íntima)
  → queda incrustado y visible en la íntima

Macrófago
  → puede entrar a la íntima atravesando segmentos dañados (diapédesis)
  → detecta LDL oxidado en íntima
  → colisiona con él → LDL oxidado desaparece
  → Macrófago se convierte en CelulaEspumosa (cambia estado)

CelulaEspumosa (inmóvil en íntima)
  → cada frame incrementa placaAltura del segmento más cercano
  → eventualmente "muere" / se absorbe (el incremento queda reflejado en placaAltura)
```

### Detalles del LDL en íntima
- Umbral único de infiltración: `desgaste >= 0.6`.
- Sin límite de LDLs oxidadas por segmento.
- LDL en íntima: visible, fijo, hasta ser consumido por un macrófago.

---

## 5. Archivos a Modificar

| Archivo | Cambios |
|---|---|
| `Segmento.js` | + `desgaste`, + `placaAltura`, render como `quad()` curvado, propagación a vecinos |
| `Endotelio.js` | Dos instancias (pared sup/inf), generación de offsets Perlin por segmento |
| `Arteria.js` | Parámetros Perlin como atributos, dos `Endotelio`, curva simétrica, `dentroDelLumen()` actualizado, límites de lumen por segmento |
| `Intima.js` | Render como curva ondulada con Perlin (en vez de `line()` recto) |
| `LDL.js` | Seek hacia segmentos dañados, lógica de infiltración, estado `"enIntima"` |
| `Macrofago.js` | Diapédesis en segmentos dañados, conversión a `CelulaEspumosa` al consumir LDL |
| `CelulaEspumosa.js` | Inmóvil, incrementa `placaAltura` del segmento vecino más cercano, puede morir |
| `Agent2D.js` | `limitarAlLumen()` y `seguirFlujo()` actualizados para curva real por segmento |
